import { Unit as UnitEntity } from '@prisma/client';
import { Unit } from '../../../../core/domain/model/Unit';
import { PrismaUnitMapper } from '../prisma-unit.mapper';

describe('PrismaUnitMapper', () => {
  const mapper = new PrismaUnitMapper();

  describe('fromDomain', () => {
    it('should map Unit to UnitEntity', () => {
      // Given
      const unit: Unit = {
        id: 'unit-1',
        title: 'Unit 1',
        description: 'Description of Unit 1',
        chapterId: 'chapter-1',
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      };

      // When
      const entity = mapper.fromDomain(unit);

      // Then
      expect(entity).toEqual({
        id: 'unit-1',
        title: 'Unit 1',
        description: 'Description of Unit 1',
        chapterId: 'chapter-1',
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map UnitEntity to Unit', () => {
      // Given
      const entity: UnitEntity = {
        id: 'unit-1',
        title: 'Unit 1',
        description: 'Description of Unit 1',
        chapterId: 'chapter-1',
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      };

      // When
      const unit = mapper.toDomain(entity);

      // Then
      expect(unit).toEqual({
        id: 'unit-1',
        title: 'Unit 1',
        description: 'Description of Unit 1',
        chapterId: 'chapter-1',
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      });
    });
  });
});
