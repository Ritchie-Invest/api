import { UseCase } from '../base/use-case';
import { Transaction } from '../domain/model/Transaction';
import { TransactionRepository } from '../domain/repository/transaction.repository';

export type GetUserTransactionsCommand = {
  portfolioId: string;
};

export type GetUserTransactionsResult = {
  transactions: Transaction[];
};

export class GetUserTransactionsUseCase
  implements UseCase<GetUserTransactionsCommand, GetUserTransactionsResult>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(
    command: GetUserTransactionsCommand,
  ): Promise<GetUserTransactionsResult> {
    let transactions = await this.transactionRepository.findByPortfolioId(
      command.portfolioId,
    );
    transactions = transactions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
    return { transactions };
  }
}
