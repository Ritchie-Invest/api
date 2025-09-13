import { PrismaUserPortfolioMapper } from '../prisma-user-portfolio.mapper';
import { UserPortfolio } from '../../../../core/domain/model/UserPortfolio';
import { UserPortfolio as UserPortfolioEntity, $Enums } from '@prisma/client';
import { Currency } from '../../../../core/domain/type/Currency';

describe('PrismaUserPortfolioMapper', () => {
  const mapper = new PrismaUserPortfolioMapper();

  const currencyMappings: { domain: Currency; prisma: $Enums.Currency }[] = [
    { domain: Currency.USD, prisma: $Enums.Currency.USD },
    { domain: Currency.EUR, prisma: $Enums.Currency.EUR },
    { domain: Currency.GBP, prisma: $Enums.Currency.GBP },
  ];

  describe('fromDomain', () => {
    it.each(currencyMappings)(
      'should map UserPortfolio to UserPortfolioEntity for %s',
      ({ domain, prisma }) => {
        // Given
        const userPortfolio = new UserPortfolio({
          id: 'portfolio-1',
          userId: 'user-1',
          currency: domain,
        });

        // When
        const entity = mapper.fromDomain(userPortfolio);

        // Then
        expect(entity).toEqual({
          id: 'portfolio-1',
          userId: 'user-1',
          currency: prisma,
        });
      },
    );
  });

  describe('toDomain', () => {
    it.each(currencyMappings)(
      'should map UserPortfolioEntity to UserPortfolio for %s',
      ({ domain, prisma }) => {
        // Given
        const entity: UserPortfolioEntity = {
          id: 'portfolio-1',
          userId: 'user-1',
          currency: prisma,
        };

        // When
        const userPortfolio = mapper.toDomain(entity);

        // Then
        expect(userPortfolio).toBeInstanceOf(UserPortfolio);
        expect(userPortfolio.id).toBe('portfolio-1');
        expect(userPortfolio.userId).toBe('user-1');
        expect(userPortfolio.currency).toBe(domain);
      },
    );
  });
});
