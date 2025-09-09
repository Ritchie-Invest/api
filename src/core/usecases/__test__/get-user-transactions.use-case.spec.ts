import { GetUserTransactionsUseCase } from '../get-user-transactions.use-case';
import { TransactionRepository } from '../../domain/repository/transaction.repository';
import { TickerRepository } from '../../domain/repository/ticker.repository';
import { Transaction } from '../../domain/model/Transaction';
import { Ticker } from '../../domain/model/Ticker';
import { TransactionType } from '../../domain/type/TransactionType';
import { TickerType } from '../../domain/type/TickerType';
import { Currency } from '../../domain/type/Currency';

describe('GetUserTransactionsUseCase', () => {
  let useCase: GetUserTransactionsUseCase;
  let transactionRepository: TransactionRepository;
  let tickerRepository: TickerRepository;

  beforeEach(() => {
    transactionRepository = {
      findByPortfolioId: jest.fn(),
      findByPortfolioIdAndTickerId: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn(),
    } as jest.Mocked<TransactionRepository>;
    tickerRepository = {
      findById: jest.fn(),
      findBySymbol: jest.fn(),
      addDailyBars: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn(),
    } as jest.Mocked<TickerRepository>;
    useCase = new GetUserTransactionsUseCase(
      transactionRepository,
      tickerRepository,
    );
  });

  it('should return all transactions for a user with ticker details', async () => {
    const portfolioId = 'portfolio-1';
    const tickerId = 'tick1';
    const transactions: Transaction[] = [
      new Transaction({
        id: 't1',
        portfolioId: portfolioId,
        tickerId: tickerId,
        type: TransactionType.BUY,
        amount: 100,
        volume: 1,
        currentTickerPrice: 100,
        timestamp: new Date(),
      }),
    ];
    const ticker = new Ticker({
      id: tickerId,
      name: 'Test Ticker',
      symbol: 'TEST',
      type: TickerType.ETF,
      currency: Currency.USD,
    });
    (transactionRepository.findByPortfolioId as jest.Mock).mockResolvedValue(
      transactions,
    );
    (tickerRepository.findById as jest.Mock).mockResolvedValue(ticker);
    const result = await useCase.execute({ portfolioId });
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toEqual({
      tickerName: 'Test Ticker',
      tickerSymbol: 'TEST',
      type: TransactionType.BUY,
      amount: 100,
      volume: 1,
      timestamp: transactions[0]?.timestamp,
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(transactionRepository.findByPortfolioId).toHaveBeenCalledWith(
      portfolioId,
      undefined,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(tickerRepository.findById).toHaveBeenCalledWith(tickerId);
  });

  it('should handle unknown ticker', async () => {
    const portfolioId = 'portfolio-1';
    const tickerId = 'tick1';
    const transactions: Transaction[] = [
      new Transaction({
        id: 't1',
        portfolioId: portfolioId,
        tickerId: tickerId,
        type: TransactionType.BUY,
        amount: 100,
        volume: 1,
        currentTickerPrice: 100,
        timestamp: new Date(),
      }),
    ];
    (transactionRepository.findByPortfolioId as jest.Mock).mockResolvedValue(
      transactions,
    );
    (tickerRepository.findById as jest.Mock).mockResolvedValue(null);
    const result = await useCase.execute({ portfolioId });
    expect(result.transactions[0]?.tickerName).toBe('Unknown');
    expect(result.transactions[0]?.tickerSymbol).toBe('UNKNOWN');
  });
});
