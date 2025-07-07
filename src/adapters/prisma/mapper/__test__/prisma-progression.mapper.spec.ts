import { PrismaProgressionMapper } from '../prisma-progression.mapper';
import { Progression } from '../../../../core/domain/model/Progression';
import { Progression as ProgressionEntity } from '@prisma/client';

describe('PrismaProgressionMapper', () => {
  const mapper = new PrismaProgressionMapper();

  describe('fromDomain', () => {
    it('should map Progression to ProgressionEntity', () => {
      // Given
      const progression = new Progression(
        'progression-1',
        'user-1',
        'gameModule-1',
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
        gameModuleId: 'gameModule-1',
        isCompleted: true,
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        createdAt: new Date('2023-10-01T11:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map ProgressionEntity to Progression', () => {
      // Given
      const entity: ProgressionEntity = {
        id: 'progression-1',
        userId: 'user-1',
        gameModuleId: 'gameModule-1',
        isCompleted: false,
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        createdAt: new Date('2023-10-01T11:00:00Z'),
      };

      // When
      const progression = mapper.toDomain(entity);

      // Then
      expect(progression).toBeInstanceOf(Progression);
      expect(progression.id).toBe('progression-1');
      expect(progression.userId).toBe('user-1');
      expect(progression.gameModuleId).toBe('gameModule-1');
      expect(progression.isCompleted).toBe(false);
      expect(progression.updatedAt).toEqual(new Date('2023-10-01T10:00:00Z'));
      expect(progression.createdAt).toEqual(new Date('2023-10-01T11:00:00Z'));
    });
  });
});
