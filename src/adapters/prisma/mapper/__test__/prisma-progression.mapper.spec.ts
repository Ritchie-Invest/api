import { PrismaProgressionMapper } from '../prisma-progression.mapper';
import {
  Progression,
  ProgressionType,
} from '../../../../core/domain/model/Progression';
import { Progression as ProgressionEntity, $Enums } from '@prisma/client';

describe('PrismaProgressionMapper', () => {
  const mapper = new PrismaProgressionMapper();

  const progressionTypeMappings: {
    domain: ProgressionType;
    prisma: $Enums.ProgressionType;
  }[] = [
    {
      domain: ProgressionType.QUESTION,
      prisma: $Enums.ProgressionType.question,
    },
    { domain: ProgressionType.LESSON, prisma: $Enums.ProgressionType.lesson },
  ];

  describe('fromDomain', () => {
    it.each(progressionTypeMappings)(
      'should map Progression to ProgressionEntity for %s',
      ({ domain, prisma }) => {
        // Given
        const progression = new Progression(
          'progression-1',
          'user-1',
          'entry-1',
          domain,
          true,
          new Date('2023-10-01T10:00:00Z'),
          new Date('2023-10-01T11:00:00Z'),
        );

        // When
        const entity = mapper.fromDomain(progression);

        // Then
        expect(entity).toEqual({
          id: 'progression-1',
          userId: 'user-1',
          entryId: 'entry-1',
          type: prisma,
          completed: true,
          updatedAt: new Date('2023-10-01T10:00:00Z'),
          createdAt: new Date('2023-10-01T11:00:00Z'),
        });
      },
    );
  });

  describe('toDomain', () => {
    it.each(progressionTypeMappings)(
      'should map ProgressionEntity to Progression for %s',
      ({ domain, prisma }) => {
        // Given
        const entity: ProgressionEntity = {
          id: 'progression-1',
          userId: 'user-1',
          entryId: 'entry-1',
          type: prisma,
          completed: false,
          updatedAt: new Date('2023-10-01T10:00:00Z'),
          createdAt: new Date('2023-10-01T11:00:00Z'),
        };

        // When
        const progression = mapper.toDomain(entity);

        // Then
        expect(progression).toBeInstanceOf(Progression);
        expect(progression.id).toBe('progression-1');
        expect(progression.userId).toBe('user-1');
        expect(progression.entryId).toBe('entry-1');
        expect(progression.type).toBe(domain);
        expect(progression.completed).toBe(false);
        expect(progression.updatedAt).toEqual(new Date('2023-10-01T10:00:00Z'));
        expect(progression.createdAt).toEqual(new Date('2023-10-01T11:00:00Z'));
      },
    );
  });

  describe('error handling', () => {
    it('should throw error for invalid progression type in fromDomain', () => {
      // Given
      const progression = new Progression(
        'progression-1',
        'user-1',
        'entry-1',
        'INVALID' as ProgressionType,
        true,
      );

      // When & Then
      expect(() => mapper.fromDomain(progression)).toThrow(
        'Invalid progression type',
      );
    });

    it('should throw error for invalid progression type in toDomain', () => {
      // Given
      const entity: ProgressionEntity = {
        id: 'progression-1',
        userId: 'user-1',
        entryId: 'entry-1',
        type: 'INVALID' as $Enums.ProgressionType,
        completed: true,
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        createdAt: new Date('2023-10-01T11:00:00Z'),
      };

      // When & Then
      expect(() => mapper.toDomain(entity)).toThrow('Invalid progression type');
    });
  });
});
