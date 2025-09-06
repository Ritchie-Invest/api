import { PrismaPortfolioTickerMapper } from '../prisma-portfolio-ticker.mapper';
import { PortfolioTicker } from '../../../../core/domain/model/PortfolioTicker';
import { PortfolioTicker as PortfolioTickerEntity } from '@prisma/client';

describe('PrismaPortfolioTickerMapper', () => {
  const mapper = new PrismaPortfolioTickerMapper();

  describe('fromDomain', () => {
    it('should map PortfolioTicker to PortfolioTickerEntity', () => {
      // Given
      const portfolioTicker = new PortfolioTicker({
        id: 'portfolioticker-1',
        portfolioId: 'portfolio-1',
        tickerId: 'ticker-1',
        value: 1000,
        shares: 10.5,
        date: new Date('2023-10-01T00:00:00Z'),
      });

      // When
      const entity = mapper.fromDomain(portfolioTicker);

      // Then
      expect(entity).toEqual({
        id: 'portfolioticker-1',
        portfolioId: 'portfolio-1',
        tickerId: 'ticker-1',
        value: 1000,
        shares: 10.5,
        date: new Date('2023-10-01T00:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map PortfolioTickerEntity to PortfolioTicker', () => {
      // Given
      const entity: PortfolioTickerEntity = {
        id: 'portfolioticker-1',
        portfolioId: 'portfolio-1',
        tickerId: 'ticker-1',
        value: 1000,
        shares: 10.5,
        date: new Date('2023-10-01T00:00:00Z'),
      };

      // When
      const portfolioTicker = mapper.toDomain(entity);

      // Then
      expect(portfolioTicker).toBeInstanceOf(PortfolioTicker);
      expect(portfolioTicker.id).toBe('portfolioticker-1');
      expect(portfolioTicker.portfolioId).toBe('portfolio-1');
      expect(portfolioTicker.tickerId).toBe('ticker-1');
      expect(portfolioTicker.value).toBe(1000);
      expect(portfolioTicker.shares).toBe(10.5);
      expect(portfolioTicker.date).toEqual(new Date('2023-10-01T00:00:00Z'));
    });
  });
});
