import {
  GetPortfolioUseCase,
  GetPortfolioCommand,
} from '../get-portfolio.use-case';
import { InMemoryUserPortfolioRepository } from '../../../adapters/in-memory/in-memory-user-portfolio.repository';
import { InMemoryPortfolioValueRepository } from '../../../adapters/in-memory/in-memory-portfolio-value.repository';
import { UserPortfolio } from '../../domain/model/UserPortfolio';
import { PortfolioValue } from '../../domain/model/PortfolioValue';
import { Currency } from '../../domain/type/Currency';

describe('GetPortfolioUseCase', () => {
  let getPortfolioUseCase: GetPortfolioUseCase;
  let userPortfolioRepository: InMemoryUserPortfolioRepository;
  let portfolioValueRepository: InMemoryPortfolioValueRepository;

  const DEFAULT_USER_ID = 'user-1';
  const DEFAULT_PORTFOLIO_ID = 'portfolio-1';

  beforeEach(() => {
    userPortfolioRepository = new InMemoryUserPortfolioRepository();
    portfolioValueRepository = new InMemoryPortfolioValueRepository();

    getPortfolioUseCase = new GetPortfolioUseCase(
      userPortfolioRepository,
      portfolioValueRepository,
    );

    userPortfolioRepository.removeAll();
    portfolioValueRepository.removeAll();
  });

  describe('execute', () => {
    it('should throw InvalidUserError when userId is empty', async () => {
      // Given
      const command: GetPortfolioCommand = { userId: '' };
      // When / Then
      await expect(getPortfolioUseCase.execute(command)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('should throw InvalidUserError when portfolio not found', async () => {
      // Given
      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };
      // When / Then
      await expect(getPortfolioUseCase.execute(command)).rejects.toThrow(
        'Portfolio not found for this user',
      );
    });

    it('should return portfolio with current day values', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.USD,
      });
      userPortfolioRepository.create(userPortfolio);

      const today = new Date();
      const portfolioValue = new PortfolioValue({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 1000,
        investments: 2000,
        date: today,
      });
      portfolioValueRepository.create(portfolioValue);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioUseCase.execute(command);

      // Then
      expect(result).toEqual({
        currency: Currency.USD,
        cash: 1000,
        investments: 2000,
        totalValue: 3000,
      });
    });

    it('should return portfolio with latest values when no current day values', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.EUR,
      });
      userPortfolioRepository.create(userPortfolio);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const portfolioValue = new PortfolioValue({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 1500,
        investments: 2500,
        date: yesterday,
      });
      portfolioValueRepository.create(portfolioValue);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const olderPortfolioValue = new PortfolioValue({
        id: 'value-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 1000,
        investments: 2000,
        date: twoDaysAgo,
      });
      portfolioValueRepository.create(olderPortfolioValue);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioUseCase.execute(command);

      // Then
      expect(result).toEqual({
        currency: Currency.EUR,
        cash: 1500,
        investments: 2500,
        totalValue: 4000,
      });
    });

    it('should return default values when no portfolio values exist', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.GBP,
      });
      userPortfolioRepository.create(userPortfolio);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioUseCase.execute(command);

      // Then
      expect(result).toEqual({
        currency: Currency.GBP,
        cash: 0,
        investments: 0,
        totalValue: 0,
      });
    });

    it('should return portfolio with zero values if portfolio values exist but are for another portfolio', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.USD,
      });
      userPortfolioRepository.create(userPortfolio);

      const unrelatedPortfolioValue = new PortfolioValue({
        id: 'value-3',
        portfolioId: 'other-portfolio',
        cash: 999,
        investments: 999,
        date: new Date(),
      });
      portfolioValueRepository.create(unrelatedPortfolioValue);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioUseCase.execute(command);

      // Then
      expect(result).toEqual({
        currency: Currency.USD,
        cash: 0,
        investments: 0,
        totalValue: 0,
      });
    });

    it('should return portfolio with correct values when multiple values exist for the same day', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.EUR,
      });
      userPortfolioRepository.create(userPortfolio);

      const today = new Date();
      const portfolioValue1 = new PortfolioValue({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 100,
        investments: 200,
        date: today,
      });
      const portfolioValue2 = new PortfolioValue({
        id: 'value-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 300,
        investments: 400,
        date: today,
      });
      portfolioValueRepository.create(portfolioValue1);
      portfolioValueRepository.create(portfolioValue2);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioUseCase.execute(command);

      expect([
        {
          currency: Currency.EUR,
          cash: 100,
          investments: 200,
          totalValue: 300,
        },
        {
          currency: Currency.EUR,
          cash: 300,
          investments: 400,
          totalValue: 700,
        },
      ]).toContainEqual(result);
    });

    it('should return portfolio with correct currency even if values are missing', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.GBP,
      });
      userPortfolioRepository.create(userPortfolio);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioUseCase.execute(command);

      // Then
      expect(result.currency).toBe(Currency.GBP);
      expect(result.cash).toBe(0);
      expect(result.investments).toBe(0);
      expect(result.totalValue).toBe(0);
    });

    it('should handle portfolio values with negative cash or investments', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.USD,
      });
      userPortfolioRepository.create(userPortfolio);

      const today = new Date();
      const portfolioValue = new PortfolioValue({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: -500,
        investments: 1000,
        date: today,
      });
      portfolioValueRepository.create(portfolioValue);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioUseCase.execute(command);

      // Then
      expect(result).toEqual({
        currency: Currency.USD,
        cash: -500,
        investments: 1000,
        totalValue: 500,
      });
    });

    it('should return the latest value if there are multiple values for different days', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.EUR,
      });
      userPortfolioRepository.create(userPortfolio);

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const value1 = new PortfolioValue({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 100,
        investments: 200,
        date: threeDaysAgo,
      });
      portfolioValueRepository.create(value1);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const value2 = new PortfolioValue({
        id: 'value-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 300,
        investments: 400,
        date: twoDaysAgo,
      });
      portfolioValueRepository.create(value2);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const value3 = new PortfolioValue({
        id: 'value-3',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 500,
        investments: 600,
        date: yesterday,
      });
      portfolioValueRepository.create(value3);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioUseCase.execute(command);

      // Then
      expect(result).toEqual({
        currency: Currency.EUR,
        cash: 500,
        investments: 600,
        totalValue: 1100,
      });
    });
  });
});
