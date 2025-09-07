import { GetUserTickersUseCase } from '../get-user-tickers.use-case';
import { InMemoryTransactionRepository } from '../../../adapters/in-memory/in-memory-transaction.repository';
import { InMemoryTickerRepository } from '../../../adapters/in-memory/in-memory-ticker.repository';
import { Transaction } from '../../domain/model/Transaction';
import { Ticker } from '../../domain/model/Ticker';
import { Currency } from '../../domain/type/Currency';
import { TransactionType } from '../../domain/type/TransactionType';
import { TickerType } from '../../domain/type/TickerType';
import { PortfolioNotFoundError } from '../../domain/error/PortfolioNotFoundError';

describe('GetUserTickersUseCase', () => {
  let useCase: GetUserTickersUseCase;
  let transactionRepository: InMemoryTransactionRepository;
  let tickerRepository: InMemoryTickerRepository;

  beforeEach(() => {
    transactionRepository = new InMemoryTransactionRepository();
    tickerRepository = new InMemoryTickerRepository();
    useCase = new GetUserTickersUseCase(
      transactionRepository,
      tickerRepository,
    );
  });

  afterEach(() => {
    transactionRepository.removeAll();
    tickerRepository.removeAll();
  });

  it('should return user tickers with correct shares and amounts', async () => {
    // Given
    const portfolioId = 'portfolio-1';

    const ticker1 = new Ticker({
      id: 'ticker-1',
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    const ticker2 = new Ticker({
      id: 'ticker-2',
      name: 'NASDAQ ETF',
      symbol: 'QQQ',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    const buyTransaction1 = new Transaction({
      id: 'transaction-1',
      portfolioId,
      tickerId: 'ticker-1',
      type: TransactionType.BUY,
      amount: 1000,
      volume: 10,
      currentTickerPrice: 100,
    });

    const buyTransaction2 = new Transaction({
      id: 'transaction-2',
      portfolioId,
      tickerId: 'ticker-1',
      type: TransactionType.BUY,
      amount: 550,
      volume: 5,
      currentTickerPrice: 110,
    });

    const buyTransaction3 = new Transaction({
      id: 'transaction-3',
      portfolioId,
      tickerId: 'ticker-2',
      type: TransactionType.BUY,
      amount: 4000,
      volume: 20,
      currentTickerPrice: 200,
    });

    tickerRepository.create(ticker1);
    tickerRepository.create(ticker2);
    transactionRepository.create(buyTransaction1);
    transactionRepository.create(buyTransaction2);
    transactionRepository.create(buyTransaction3);

    // When
    const result = await useCase.execute({ portfolioId });

    // Then
    expect(result.tickers).toHaveLength(2);
    
    const spy = result.tickers.find(t => t.symbol === 'SPY');
    expect(spy).toBeDefined();
    expect(spy!.id).toBe('ticker-1');
    expect(spy!.name).toBe('S&P 500 ETF');
    expect(spy!.shares).toBe(15); 
    expect(spy!.amount).toBe(1550);

    const qqq = result.tickers.find(t => t.symbol === 'QQQ');
    expect(qqq).toBeDefined();
    expect(qqq!.id).toBe('ticker-2');
    expect(qqq!.name).toBe('NASDAQ ETF');
    expect(qqq!.shares).toBe(20);
    expect(qqq!.amount).toBe(4000);
  });

  it('should handle buy and sell transactions correctly', async () => {
    // Given
    const portfolioId = 'portfolio-1';

    const tickerEntity = new Ticker({
      id: 'ticker-1',
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    const buyTransaction = new Transaction({
      id: 'transaction-1',
      portfolioId,
      tickerId: 'ticker-1',
      type: TransactionType.BUY,
      amount: 2000,
      volume: 20,
      currentTickerPrice: 100,
    });

    const sellTransaction = new Transaction({
      id: 'transaction-2',
      portfolioId,
      tickerId: 'ticker-1',
      type: TransactionType.SELL,
      amount: 550,
      volume: 5,
      currentTickerPrice: 110,
    });

    tickerRepository.create(tickerEntity);
    transactionRepository.create(buyTransaction);
    transactionRepository.create(sellTransaction);

    // When
    const result = await useCase.execute({ portfolioId });

    // Then
    expect(result.tickers).toHaveLength(1);
    const userTicker = result.tickers[0]!;
    expect(userTicker.shares).toBe(15); 
    expect(userTicker.amount).toBe(1450); 
  });

  it('should not return tickers with zero or negative shares', async () => {
    // Given
    const portfolioId = 'portfolio-1';

    const tickerEntity = new Ticker({
      id: 'ticker-1',
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    const buyTransaction = new Transaction({
      id: 'transaction-1',
      portfolioId,
      tickerId: 'ticker-1',
      type: TransactionType.BUY,
      amount: 1000,
      volume: 10,
      currentTickerPrice: 100,
    });

    const sellTransaction = new Transaction({
      id: 'transaction-2',
      portfolioId,
      tickerId: 'ticker-1',
      type: TransactionType.SELL,
      amount: 1100,
      volume: 10,
      currentTickerPrice: 110,
    });

    tickerRepository.create(tickerEntity);
    transactionRepository.create(buyTransaction);
    transactionRepository.create(sellTransaction);

    // When
    const result = await useCase.execute({ portfolioId });

    // Then
    expect(result.tickers).toHaveLength(0);
  });

  it('should return empty array when user has no transactions', async () => {
    // Given
    const portfolioId = 'portfolio-1';

    // When
    const result = await useCase.execute({ portfolioId });

    // Then
    expect(result.tickers).toHaveLength(0);
  });

  it('should throw PortfolioNotFoundError when portfolioId is not provided', async () => {
    // When & Then
    await expect(useCase.execute({ portfolioId: '' })).rejects.toThrow(
      PortfolioNotFoundError,
    );
  });
});
