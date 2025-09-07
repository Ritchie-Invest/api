import {
  ExecuteTransactionCommand,
  ExecuteTransactionUseCase,
} from '../execute-transaction.use-case';
import { TransactionType } from '../../domain/type/TransactionType';
import { Currency } from '../../domain/type/Currency';
import { TickerType } from '../../domain/type/TickerType';
import { Ticker } from '../../domain/model/Ticker';
import { DailyBar } from '../../domain/model/DailyBar';
import { UserPortfolio } from '../../domain/model/UserPortfolio';
import { PortfolioPosition } from '../../domain/model/PortfolioPosition';
import { InsufficientCashError } from '../../domain/error/InsufficientCashError';
import { InsufficientHoldingsError } from '../../domain/error/InsufficientHoldingsError';
import { DailyBarNotFoundError } from '../../domain/error/DailyBarNotFoundError';
import { InMemoryUserPortfolioRepository } from '../../../adapters/in-memory/in-memory-user-portfolio.repository';
import { InMemoryTickerRepository } from '../../../adapters/in-memory/in-memory-ticker.repository';
import { InMemoryDailyBarRepository } from '../../../adapters/in-memory/in-memory-daily-bar.repository';
import { InMemoryPortfolioPositionRepository } from '../../../adapters/in-memory/in-memory-portfolio-position.repository';
import { InMemoryTransactionRepository } from '../../../adapters/in-memory/in-memory-transaction.repository';

describe('ExecuteTransactionUseCase', () => {
  let executeTransactionUseCase: ExecuteTransactionUseCase;
  let userPortfolioRepository: InMemoryUserPortfolioRepository;
  let tickerRepository: InMemoryTickerRepository;
  let dailyBarRepository: InMemoryDailyBarRepository;
  let PortfolioPositionRepository: InMemoryPortfolioPositionRepository;
  let transactionRepository: InMemoryTransactionRepository;

  const DEFAULT_PORTFOLIO_ID = 'portfolio-1';
  const DEFAULT_TICKER_ID = 'ticker-1';
  const DEFAULT_AMOUNT = 1000;
  const DEFAULT_SHARE_PRICE = 100;

  beforeEach(() => {
    userPortfolioRepository = new InMemoryUserPortfolioRepository();
    tickerRepository = new InMemoryTickerRepository();
    dailyBarRepository = new InMemoryDailyBarRepository();
    PortfolioPositionRepository = new InMemoryPortfolioPositionRepository();
    transactionRepository = new InMemoryTransactionRepository();

    executeTransactionUseCase = new ExecuteTransactionUseCase(
      userPortfolioRepository,
      tickerRepository,
      dailyBarRepository,
      PortfolioPositionRepository,
      transactionRepository,
    );

    userPortfolioRepository.removeAll();
    tickerRepository.removeAll();
    dailyBarRepository.removeAll();
    PortfolioPositionRepository.removeAll();
    transactionRepository.removeAll();
  });

  const makeExecuteTransactionCommand = (
    portfolioId = DEFAULT_PORTFOLIO_ID,
    tickerId = DEFAULT_TICKER_ID,
    type = TransactionType.BUY,
    amount = DEFAULT_AMOUNT,
  ): ExecuteTransactionCommand => ({
    portfolioId,
    tickerId,
    type,
    amount,
  });

  const setupTestData = () => {
    const portfolio = userPortfolioRepository.create(
      new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: 'user-1',
        currency: Currency.USD,
      }),
    );

    const ticker = tickerRepository.create(
      new Ticker({
        id: DEFAULT_TICKER_ID,
        name: 'Test Ticker',
        symbol: 'TEST',
        type: TickerType.ETF,
        currency: Currency.USD,
      }),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyBar = dailyBarRepository.create(
      new DailyBar({
        id: 'dailybar-1',
        tickerId: DEFAULT_TICKER_ID,
        timestamp: today,
        open: DEFAULT_SHARE_PRICE,
        high: DEFAULT_SHARE_PRICE,
        low: DEFAULT_SHARE_PRICE,
        close: DEFAULT_SHARE_PRICE,
        volume: 1000,
      }),
    );

    return { portfolio, ticker, dailyBar, today };
  };

  it('should execute buy transaction with sufficient cash', async () => {
    // Given
    const { today } = setupTestData();
    const command = makeExecuteTransactionCommand();

    PortfolioPositionRepository.create(
      new PortfolioPosition({
        id: 'PortfolioPosition-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 5000,
        investments: 2000,
        date: today,
      }),
    );

    // When
    const result = await executeTransactionUseCase.execute(command);

    // Then
    expect(result).toEqual({
      cash: 4000,
      investments: 3000,
      tickerHoldings: 1000,
    });

    const transactions = transactionRepository.findAll();
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      portfolioId: DEFAULT_PORTFOLIO_ID,
      tickerId: DEFAULT_TICKER_ID,
      type: TransactionType.BUY,
      amount: DEFAULT_AMOUNT,
      volume: 10,
      currentTickerPrice: DEFAULT_SHARE_PRICE,
    });
  });

  it('should throw InsufficientCashError when buying with insufficient cash', async () => {
    // Given
    const { today } = setupTestData();
    const command = makeExecuteTransactionCommand();

    PortfolioPositionRepository.create(
      new PortfolioPosition({
        id: 'PortfolioPosition-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 500,
        investments: 2000,
        date: today,
      }),
    );

    // When & Then
    await expect(executeTransactionUseCase.execute(command)).rejects.toThrow(
      InsufficientCashError,
    );
  });

  it('should execute sell transaction with sufficient holdings', async () => {
    // Given
    const { today } = setupTestData();
    const command = makeExecuteTransactionCommand(
      DEFAULT_PORTFOLIO_ID,
      DEFAULT_TICKER_ID,
      TransactionType.SELL,
    );

    PortfolioPositionRepository.create(
      new PortfolioPosition({
        id: 'PortfolioPosition-3',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 3000,
        investments: 4000,
        date: today,
      }),
    );

    transactionRepository.create({
      id: 'transaction-1',
      portfolioId: DEFAULT_PORTFOLIO_ID,
      tickerId: DEFAULT_TICKER_ID,
      type: TransactionType.BUY,
      amount: 2000,
      volume: 20, // 2000 / 100 = 20 shares
      currentTickerPrice: DEFAULT_SHARE_PRICE,
    });

    // When
    const result = await executeTransactionUseCase.execute(command);

    // Then
    expect(result).toEqual({
      cash: 4000,
      investments: 3000,
      tickerHoldings: 1000,
    });
  });

  it('should throw InsufficientHoldingsError when selling with insufficient holdings', async () => {
    // Given
    const { today } = setupTestData();
    const command = makeExecuteTransactionCommand(
      DEFAULT_PORTFOLIO_ID,
      DEFAULT_TICKER_ID,
      TransactionType.SELL,
      2000,
    );

    PortfolioPositionRepository.create(
      new PortfolioPosition({
        id: 'PortfolioPosition-4',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 3000,
        investments: 4000,
        date: today,
      }),
    );

    transactionRepository.create({
      id: 'transaction-2',
      portfolioId: DEFAULT_PORTFOLIO_ID,
      tickerId: DEFAULT_TICKER_ID,
      type: TransactionType.BUY,
      amount: 500,
      volume: 5, // 500 / 100 = 5 shares
      currentTickerPrice: DEFAULT_SHARE_PRICE,
    });

    // When & Then
    await expect(executeTransactionUseCase.execute(command)).rejects.toThrow(
      InsufficientHoldingsError,
    );
  });

  it('should throw DailyBarNotFoundError when daily bar is missing', async () => {
    // Given
    const { today } = setupTestData();
    dailyBarRepository.removeAll();
    const command = makeExecuteTransactionCommand();

    PortfolioPositionRepository.create(
      new PortfolioPosition({
        id: 'PortfolioPosition-5',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 5000,
        investments: 2000,
        date: today,
      }),
    );

    // When & Then
    await expect(executeTransactionUseCase.execute(command)).rejects.toThrow(
      DailyBarNotFoundError,
    );
  });
});
