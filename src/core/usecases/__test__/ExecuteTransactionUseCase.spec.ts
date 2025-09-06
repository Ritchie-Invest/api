import {
  ExecuteTransactionCommand,
  ExecuteTransactionUseCase,
} from '../ExecuteTransactionUseCase';
import { TransactionType } from '../../domain/type/TransactionType';
import { Currency } from '../../domain/type/Currency';
import { TickerType } from '../../domain/type/TickerType';
import { Ticker } from '../../domain/model/Ticker';
import { DailyBar } from '../../domain/model/DailyBar';
import { UserPortfolio } from '../../domain/model/UserPortfolio';
import { PortfolioValue } from '../../domain/model/PortfolioValue';
import { PortfolioTicker } from '../../domain/model/PortfolioTicker';
import { InsufficientCashError } from '../../domain/error/InsufficientCashError';
import { InsufficientHoldingsError } from '../../domain/error/InsufficientHoldingsError';
import { DailyBarNotFoundError } from '../../domain/error/DailyBarNotFoundError';
import { InMemoryUserPortfolioRepository } from '../../../adapters/in-memory/in-memory-user-portfolio.repository';
import { InMemoryTickerRepository } from '../../../adapters/in-memory/in-memory-ticker.repository';
import { InMemoryDailyBarRepository } from '../../../adapters/in-memory/in-memory-daily-bar.repository';
import { InMemoryPortfolioValueRepository } from '../../../adapters/in-memory/in-memory-portfolio-value.repository';
import { InMemoryPortfolioTickerRepository } from '../../../adapters/in-memory/in-memory-portfolio-ticker.repository';
import { InMemoryTransactionRepository } from '../../../adapters/in-memory/in-memory-transaction.repository';

describe('ExecuteTransactionUseCase', () => {
  let executeTransactionUseCase: ExecuteTransactionUseCase;
  let userPortfolioRepository: InMemoryUserPortfolioRepository;
  let tickerRepository: InMemoryTickerRepository;
  let dailyBarRepository: InMemoryDailyBarRepository;
  let portfolioValueRepository: InMemoryPortfolioValueRepository;
  let portfolioTickerRepository: InMemoryPortfolioTickerRepository;
  let transactionRepository: InMemoryTransactionRepository;

  const DEFAULT_PORTFOLIO_ID = 'portfolio-1';
  const DEFAULT_TICKER_ID = 'ticker-1';
  const DEFAULT_VALUE = 1000;
  const DEFAULT_SHARE_PRICE = 100;

  beforeEach(() => {
    userPortfolioRepository = new InMemoryUserPortfolioRepository();
    tickerRepository = new InMemoryTickerRepository();
    dailyBarRepository = new InMemoryDailyBarRepository();
    portfolioValueRepository = new InMemoryPortfolioValueRepository();
    portfolioTickerRepository = new InMemoryPortfolioTickerRepository();
    transactionRepository = new InMemoryTransactionRepository();

    executeTransactionUseCase = new ExecuteTransactionUseCase(
      userPortfolioRepository,
      tickerRepository,
      dailyBarRepository,
      portfolioValueRepository,
      portfolioTickerRepository,
      transactionRepository,
    );

    userPortfolioRepository.removeAll();
    tickerRepository.removeAll();
    dailyBarRepository.removeAll();
    portfolioValueRepository.removeAll();
    portfolioTickerRepository.removeAll();
    transactionRepository.removeAll();
  });

  const makeExecuteTransactionCommand = (
    portfolioId = DEFAULT_PORTFOLIO_ID,
    tickerId = DEFAULT_TICKER_ID,
    type = TransactionType.Buy,
    value = DEFAULT_VALUE,
  ): ExecuteTransactionCommand => ({
    portfolioId,
    tickerId,
    type,
    value,
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

    portfolioValueRepository.create(
      new PortfolioValue({
        id: 'portfoliovalue-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 5000,
        investments: 2000,
        date: today,
      }),
    );

    portfolioTickerRepository.create(
      new PortfolioTicker({
        id: 'portfolioticker-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: DEFAULT_TICKER_ID,
        value: 500,
        shares: 5,
        date: today,
      }),
    );

    // When
    const result = await executeTransactionUseCase.execute(command);

    // Then
    expect(result).toEqual({
      cash: 4000,
      investments: 3000,
      tickerHoldings: 1500,
    });

    const transactions = transactionRepository.findAll();
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      portfolioId: DEFAULT_PORTFOLIO_ID,
      tickerId: DEFAULT_TICKER_ID,
      type: TransactionType.Buy,
      value: DEFAULT_VALUE,
    });
  });

  it('should throw InsufficientCashError when buying with insufficient cash', async () => {
    // Given
    const { today } = setupTestData();
    const command = makeExecuteTransactionCommand();

    portfolioValueRepository.create(
      new PortfolioValue({
        id: 'portfoliovalue-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 500,
        investments: 2000,
        date: today,
      }),
    );

    portfolioTickerRepository.create(
      new PortfolioTicker({
        id: 'portfolioticker-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: DEFAULT_TICKER_ID,
        value: 500,
        shares: 5,
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
      TransactionType.Sell,
    );

    portfolioValueRepository.create(
      new PortfolioValue({
        id: 'portfoliovalue-3',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 3000,
        investments: 4000,
        date: today,
      }),
    );

    portfolioTickerRepository.create(
      new PortfolioTicker({
        id: 'portfolioticker-3',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: DEFAULT_TICKER_ID,
        value: 2000,
        shares: 20,
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
  });

  it('should throw InsufficientHoldingsError when selling with insufficient holdings', async () => {
    // Given
    const { today } = setupTestData();
    const command = makeExecuteTransactionCommand(
      DEFAULT_PORTFOLIO_ID,
      DEFAULT_TICKER_ID,
      TransactionType.Sell,
      2000,
    );

    portfolioValueRepository.create(
      new PortfolioValue({
        id: 'portfoliovalue-4',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 3000,
        investments: 4000,
        date: today,
      }),
    );

    portfolioTickerRepository.create(
      new PortfolioTicker({
        id: 'portfolioticker-4',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: DEFAULT_TICKER_ID,
        value: 500,
        shares: 5,
        date: today,
      }),
    );

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

    portfolioValueRepository.create(
      new PortfolioValue({
        id: 'portfoliovalue-5',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 5000,
        investments: 2000,
        date: today,
      }),
    );

    portfolioTickerRepository.create(
      new PortfolioTicker({
        id: 'portfolioticker-5',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        tickerId: DEFAULT_TICKER_ID,
        value: 500,
        shares: 5,
        date: today,
      }),
    );

    // When & Then
    await expect(executeTransactionUseCase.execute(command)).rejects.toThrow(
      DailyBarNotFoundError,
    );
  });
});
