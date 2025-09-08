import { GetUserTransactionsUseCase } from '../get-user-transactions.use-case';
import { TransactionRepository } from '../../domain/repository/transaction.repository';
import { Transaction } from '../../domain/model/Transaction';
import { TransactionType } from '../../domain/type/TransactionType';

describe('GetUserTransactionsUseCase', () => {
  let useCase: GetUserTransactionsUseCase;
  let transactionRepository: TransactionRepository;

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
    useCase = new GetUserTransactionsUseCase(transactionRepository);
  });

  it('should return all transactions for a user', async () => {
    const portfolioId = 'portfolio-1';
    const transactions: Transaction[] = [
      new Transaction({
        id: 't1',
        portfolioId: portfolioId,
        tickerId: 'tick1',
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
    const result = await useCase.execute({ portfolioId });
    expect(result.transactions).toEqual(transactions);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(transactionRepository.findByPortfolioId).toHaveBeenCalledWith(
      portfolioId,
    );
  });
});
