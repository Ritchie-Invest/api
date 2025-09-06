import { PrismaPortfolioValueMapper } from '../prisma-portfolio-value.mapper';
import { PortfolioValue } from '../../../../core/domain/model/PortfolioValue';
import { PortfolioValue as PortfolioValueEntity } from '@prisma/client';

describe('PrismaPortfolioValueMapper', () => {
  const mapper = new PrismaPortfolioValueMapper();

  describe('fromDomain', () => {
    it('should map PortfolioValue to PortfolioValueEntity', () => {
      // Given
      const portfolioValue = new PortfolioValue({
        id: 'portfoliovalue-1',
        portfolioId: 'portfolio-1',
        cash: 5000,
        investments: 2000,
        date: new Date('2023-10-01T00:00:00Z'),
      });

      // When
      const entity = mapper.fromDomain(portfolioValue);

      // Then
      expect(entity).toEqual({
        id: 'portfoliovalue-1',
        portfolioId: 'portfolio-1',
        cash: 5000,
        investments: 2000,
        date: new Date('2023-10-01T00:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map PortfolioValueEntity to PortfolioValue', () => {
      // Given
      const entity: PortfolioValueEntity = {
        id: 'portfoliovalue-1',
        portfolioId: 'portfolio-1',
        cash: 5000,
        investments: 2000,
        date: new Date('2023-10-01T00:00:00Z'),
      };

      // When
      const portfolioValue = mapper.toDomain(entity);

      // Then
      expect(portfolioValue).toBeInstanceOf(PortfolioValue);
      expect(portfolioValue.id).toBe('portfoliovalue-1');
      expect(portfolioValue.portfolioId).toBe('portfolio-1');
      expect(portfolioValue.cash).toBe(5000);
      expect(portfolioValue.investments).toBe(2000);
      expect(portfolioValue.date).toEqual(new Date('2023-10-01T00:00:00Z'));
    });
  });
});
