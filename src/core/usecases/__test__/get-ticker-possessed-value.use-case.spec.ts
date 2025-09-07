import { GetTickerPossessedValueUseCase } from '../get-ticker-possessed-value.use-case';
import { InMemoryUserPortfolioRepository } from '../../../adapters/in-memory/in-memory-user-portfolio.repository';
import { InMemoryTransactionRepository } from '../../../adapters/in-memory/in-memory-transaction.repository';
import { InMemoryTickerRepository } from '../../../adapters/in-memory/in-memory-ticker.repository';
import { UserPortfolio } from '../../domain/model/UserPortfolio';
import { Transaction } from '../../domain/model/Transaction';
import { Ticker } from '../../domain/model/Ticker';
import { Currency } from '../../domain/type/Currency';
import { TransactionType } from '../../domain/type/TransactionType';
import { TickerType } from '../../domain/type/TickerType';

describe('GetTickerPossessedValueUseCase', () => {
  let useCase: GetTickerPossessedValueUseCase;
  let userPortfolioRepository: InMemoryUserPortfolioRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let tickerRepository: InMemoryTickerRepository;

  beforeEach(() => {
    userPortfolioRepository = new InMemoryUserPortfolioRepository();
    transactionRepository = new InMemoryTransactionRepository();
    tickerRepository = new InMemoryTickerRepository();
    useCase = new GetTickerPossessedValueUseCase(
      userPortfolioRepository,
      transactionRepository,
      tickerRepository,
    );
  });

  it('should calculate correctly possessed value with buy and sell transactions', async () => {
    // Given
    const userId = 'user-1';
    const tickerId = 'ticker-1';
    const portfolioId = 'portfolio-1';

    const portfolio = new UserPortfolio({
      id: portfolioId,
      userId,
      currency: Currency.USD,
    });

    const ticker = new Ticker({
      id: tickerId,
      name: 'Apple',
      symbol: 'AAPL',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    const buyTransaction1 = new Transaction({
      id: 'transaction-1',
      portfolioId,
      tickerId,
      type: TransactionType.BUY,
      amount: 1000,
      volume: 10,
      currentTickerPrice: 100,
    });

    const buyTransaction2 = new Transaction({
      id: 'transaction-2',
      portfolioId,
      tickerId,
      type: TransactionType.BUY,
      amount: 2000,
      volume: 20,
      currentTickerPrice: 100,
    });

    const sellTransaction = new Transaction({
      id: 'transaction-3',
      portfolioId,
      tickerId,
      type: TransactionType.SELL,
      amount: 500,
      volume: 5,
      currentTickerPrice: 100,
    });

    userPortfolioRepository.create(portfolio);
    tickerRepository.create(ticker);
    transactionRepository.create(buyTransaction1);
    transactionRepository.create(buyTransaction2);
    transactionRepository.create(sellTransaction);

    // When
    const result = await useCase.execute({ userId, tickerId });

    // Then
    expect(result.tickerId).toBe(tickerId);
    expect(result.shares).toBe(25);
    expect(result.amount).toBe(2500);
  });

  it('should return zero values when no transactions exist', async () => {
    // Given
    const userId = 'user-1';
    const tickerId = 'ticker-1';
    const portfolioId = 'portfolio-1';

    const portfolio = new UserPortfolio({
      id: portfolioId,
      userId,
      currency: Currency.USD,
    });

    const ticker = new Ticker({
      id: tickerId,
      name: 'Apple',
      symbol: 'AAPL',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    userPortfolioRepository.create(portfolio);
    tickerRepository.create(ticker);

    // When
    const result = await useCase.execute({ userId, tickerId });

    // Then
    expect(result.tickerId).toBe(tickerId);
    expect(result.shares).toBe(0);
    expect(result.amount).toBe(0);
  });

  it('should throw error when portfolio not found', async () => {
    // Given
    const userId = 'non-existent-user';
    const tickerId = 'ticker-1';

    const ticker = new Ticker({
      id: tickerId,
      name: 'Apple',
      symbol: 'AAPL',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    tickerRepository.create(ticker);

    // When & Then
    await expect(useCase.execute({ userId, tickerId })).rejects.toThrow(
      'Portfolio not found',
    );
  });

  it('should throw error when ticker not found', async () => {
    // Given
    const userId = 'user-1';
    const tickerId = 'non-existent-ticker';
    const portfolioId = 'portfolio-1';

    const portfolio = new UserPortfolio({
      id: portfolioId,
      userId,
      currency: Currency.USD,
    });

    userPortfolioRepository.create(portfolio);

    // When & Then
    await expect(useCase.execute({ userId, tickerId })).rejects.toThrow(
      'Ticker not found',
    );
  });

  it('should handle negative shares when more sells than buys', async () => {
    // Given
    const userId = 'user-1';
    const tickerId = 'ticker-1';
    const portfolioId = 'portfolio-1';

    const portfolio = new UserPortfolio({
      id: portfolioId,
      userId,
      currency: Currency.USD,
    });

    const ticker = new Ticker({
      id: tickerId,
      name: 'Apple',
      symbol: 'AAPL',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    const buyTransaction = new Transaction({
      id: 'transaction-1',
      portfolioId,
      tickerId,
      type: TransactionType.BUY,
      amount: 1000,
      volume: 10,
      currentTickerPrice: 100,
    });

    const sellTransaction = new Transaction({
      id: 'transaction-2',
      portfolioId,
      tickerId,
      type: TransactionType.SELL,
      amount: 1500,
      volume: 15,
      currentTickerPrice: 100,
    });

    userPortfolioRepository.create(portfolio);
    tickerRepository.create(ticker);
    transactionRepository.create(buyTransaction);
    transactionRepository.create(sellTransaction);

    // When
    const result = await useCase.execute({ userId, tickerId });

    // Then
    expect(result.tickerId).toBe(tickerId);
    expect(result.shares).toBe(-5);
    expect(result.amount).toBe(-500);
  });
});
