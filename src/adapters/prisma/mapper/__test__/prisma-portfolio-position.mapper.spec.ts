import { PrismaPortfolioPositionMapper } from '../prisma-portfolio-position.mapper';
import { PortfolioPosition } from '../../../../core/domain/model/PortfolioPosition';
import { PortfolioPosition as PortfolioPositionEntity } from '@prisma/client';

describe('PrismaPortfolioPositionMapper', () => {
  const mapper = new PrismaPortfolioPositionMapper();

  describe('fromDomain', () => {
    it('should map PortfolioPosition to PortfolioPositionEntity', () => {
      // Given
      const portfolioPosition = new PortfolioPosition({
        id: 'PortfolioPosition-1',
        portfolioId: 'portfolio-1',
        cash: 5000,
        investments: 2000,
        date: new Date('2023-10-01T00:00:00Z'),
      });

      // When
      const entity = mapper.fromDomain(portfolioPosition);

      // Then
      expect(entity).toEqual({
        id: 'PortfolioPosition-1',
        portfolioId: 'portfolio-1',
        cash: 5000,
        investments: 2000,
        date: new Date('2023-10-01T00:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map PortfolioPositionEntity to PortfolioPosition', () => {
      // Given
      const entity: PortfolioPositionEntity = {
        id: 'PortfolioPosition-1',
        portfolioId: 'portfolio-1',
        cash: 5000,
        investments: 2000,
        date: new Date('2023-10-01T00:00:00Z'),
      };

      // When
      const portfolioPosition = mapper.toDomain(entity);

      // Then
      expect(portfolioPosition).toBeInstanceOf(PortfolioPosition);
      expect(portfolioPosition.id).toBe('PortfolioPosition-1');
      expect(portfolioPosition.portfolioId).toBe('portfolio-1');
      expect(portfolioPosition.cash).toBe(5000);
      expect(portfolioPosition.investments).toBe(2000);
      expect(portfolioPosition.date).toEqual(new Date('2023-10-01T00:00:00Z'));
    });
  });
});
