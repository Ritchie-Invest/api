import { PrismaLifeMapper } from '../prisma-life.mapper';
import { Life } from '../../../../core/domain/model/Life';
import { Life as LifeEntity } from '@prisma/client';

describe('PrismaLifeMapper', () => {
  const mapper = new PrismaLifeMapper();

  describe('fromDomain', () => {
    it('should map Life to LifeEntity', () => {
      // Given
      const lostAt = new Date('2023-10-01T10:00:00Z');
      const life = new Life({
        id: 'life-1',
        userId: 'user-1',
        lostAt,
      });

      // When
      const entity = mapper.fromDomain(life);

      // Then
      expect(entity).toEqual({
        id: 'life-1',
        userId: 'user-1',
        lostAt,
      });
    });
  });

  describe('toDomain', () => {
    it('should map LifeEntity to Life', () => {
      // Given
      const lostAt = new Date('2023-10-01T10:00:00Z');
      const entity: LifeEntity = {
        id: 'life-1',
        userId: 'user-1',
        lostAt,
      };

      // When
      const life = mapper.toDomain(entity);

      // Then
      expect(life).toEqual({
        id: 'life-1',
        userId: 'user-1',
        lostAt,
      });
    });
  });
});
