import {
  GetPortfolioUseCase,
  GetPortfolioCommand,
} from '../get-portfolio.use-case';
import { InMemoryUserPortfolioRepository } from '../../../adapters/in-memory/in-memory-user-portfolio.repository';
import { InMemoryPortfolioPositionRepository } from '../../../adapters/in-memory/in-memory-portfolio-position.repository';
import { InMemoryTransactionRepository } from '../../../adapters/in-memory/in-memory-transaction.repository';
import { InMemoryDailyBarRepository } from '../../../adapters/in-memory/in-memory-daily-bar.repository';
import { UserPortfolio } from '../../domain/model/UserPortfolio';
import { PortfolioPosition } from '../../domain/model/PortfolioPosition';
import { Currency } from '../../domain/type/Currency';
import { TransactionType } from '../../domain/type/TransactionType';

describe('GetPortfolioUseCase', () => {
  let getPortfolioUseCase: GetPortfolioUseCase;
  let userPortfolioRepository: InMemoryUserPortfolioRepository;
  let PortfolioPositionRepository: InMemoryPortfolioPositionRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let dailyBarRepository: InMemoryDailyBarRepository;

  const DEFAULT_USER_ID = 'user-1';
  const DEFAULT_PORTFOLIO_ID = 'portfolio-1';

  beforeEach(() => {
    userPortfolioRepository = new InMemoryUserPortfolioRepository();
    PortfolioPositionRepository = new InMemoryPortfolioPositionRepository();
    transactionRepository = new InMemoryTransactionRepository();
    dailyBarRepository = new InMemoryDailyBarRepository();

    getPortfolioUseCase = new GetPortfolioUseCase(
      userPortfolioRepository,
      PortfolioPositionRepository,
      transactionRepository,
      dailyBarRepository,
    );

    userPortfolioRepository.removeAll();
    PortfolioPositionRepository.removeAll();
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
      today.setHours(0, 0, 0, 0);
      const portfolioPosition = new PortfolioPosition({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 1000,
        investments: 2000,
        date: today,
      });
      PortfolioPositionRepository.create(portfolioPosition);

      dailyBarRepository.create({
        id: 'db-1',
        tickerId: 'ticker-1',
        timestamp: today,
        open: 100,
        high: 100,
        low: 100,
        close: 100,
        volume: 100,
      });
      transactionRepository.create({
        id: 'tx-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: 'ticker-1',
        type: TransactionType.BUY,
        amount: 2000,
        volume: 20,
        currentTickerPrice: 100,
        timestamp: new Date(),
      });

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
      const portfolioPosition1 = new PortfolioPosition({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 1500,
        investments: 2500,
        date: yesterday,
      });
      PortfolioPositionRepository.create(portfolioPosition1);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const olderPortfolioPosition = new PortfolioPosition({
        id: 'value-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 1000,
        investments: 2000,
        date: twoDaysAgo,
      });
      PortfolioPositionRepository.create(olderPortfolioPosition);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      dailyBarRepository.create({
        id: 'db-2',
        tickerId: 'ticker-1',
        timestamp: yesterday,
        open: 100,
        high: 100,
        low: 100,
        close: 100,
        volume: 100,
      });
      transactionRepository.create({
        id: 'tx-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: 'ticker-1',
        type: TransactionType.BUY,
        amount: 2500,
        volume: 25,
        currentTickerPrice: 100,
        timestamp: new Date(),
      });

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

    it("should create today's position from latest when current day missing", async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.GBP,
      });
      userPortfolioRepository.create(userPortfolio);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const portfolioPosition1 = new PortfolioPosition({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 1500,
        investments: 2500,
        date: yesterday,
      });
      PortfolioPositionRepository.create(portfolioPosition1);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      dailyBarRepository.create({
        id: 'db-3',
        tickerId: 'ticker-1',
        timestamp: yesterday,
        open: 100,
        high: 100,
        low: 100,
        close: 100,
        volume: 100,
      });
      transactionRepository.create({
        id: 'tx-3',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: 'ticker-1',
        type: TransactionType.BUY,
        amount: 2500,
        volume: 25,
        currentTickerPrice: 100,
        timestamp: new Date(),
      });

      // When
      const result = await getPortfolioUseCase.execute(command);

      // Then
      expect(result).toEqual({
        currency: Currency.GBP,
        cash: 1500,
        investments: 2500,
        totalValue: 4000,
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

      const unrelatedPortfolioPosition = new PortfolioPosition({
        id: 'value-3',
        portfolioId: 'other-portfolio',
        cash: 999,
        investments: 999,
        date: new Date(),
      });
      PortfolioPositionRepository.create(unrelatedPortfolioPosition);

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
      today.setHours(0, 0, 0, 0);
      const PortfolioPosition1 = new PortfolioPosition({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 100,
        investments: 200,
        date: today,
      });
      const PortfolioPosition2 = new PortfolioPosition({
        id: 'value-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 300,
        investments: 400,
        date: today,
      });
      PortfolioPositionRepository.create(PortfolioPosition1);
      PortfolioPositionRepository.create(PortfolioPosition2);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      dailyBarRepository.create({
        id: 'db-4',
        tickerId: 'ticker-1',
        timestamp: today,
        open: 100,
        high: 100,
        low: 100,
        close: 100,
        volume: 100,
      });
      transactionRepository.create({
        id: 'tx-4',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: 'ticker-1',
        type: TransactionType.BUY,
        amount: 200,
        volume: 2,
        currentTickerPrice: 100,
        timestamp: new Date(),
      });
      transactionRepository.create({
        id: 'tx-5',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: 'ticker-1',
        type: TransactionType.BUY,
        amount: 400,
        volume: 4,
        currentTickerPrice: 100,
        timestamp: new Date(),
      });

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
      today.setHours(0, 0, 0, 0);
      const portfolioPosition = new PortfolioPosition({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: -500,
        investments: 1000,
        date: today,
      });
      PortfolioPositionRepository.create(portfolioPosition);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      dailyBarRepository.create({
        id: 'db-5',
        tickerId: 'ticker-1',
        timestamp: today,
        open: 100,
        high: 100,
        low: 100,
        close: 100,
        volume: 100,
      });
      transactionRepository.create({
        id: 'tx-6',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: 'ticker-1',
        type: TransactionType.BUY,
        amount: 1000,
        volume: 10,
        currentTickerPrice: 100,
        timestamp: new Date(),
      });

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
      const value1 = new PortfolioPosition({
        id: 'value-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 100,
        investments: 200,
        date: threeDaysAgo,
      });
      PortfolioPositionRepository.create(value1);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const value2 = new PortfolioPosition({
        id: 'value-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 300,
        investments: 400,
        date: twoDaysAgo,
      });
      PortfolioPositionRepository.create(value2);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const value3 = new PortfolioPosition({
        id: 'value-3',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 500,
        investments: 600,
        date: yesterday,
      });
      PortfolioPositionRepository.create(value3);

      const command: GetPortfolioCommand = { userId: DEFAULT_USER_ID };

      dailyBarRepository.create({
        id: 'db-6',
        tickerId: 'ticker-1',
        timestamp: yesterday,
        open: 100,
        high: 100,
        low: 100,
        close: 100,
        volume: 100,
      });
      transactionRepository.create({
        id: 'tx-7',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: 'ticker-1',
        type: TransactionType.BUY,
        amount: 600,
        volume: 6,
        currentTickerPrice: 100,
        timestamp: new Date(),
      });

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
