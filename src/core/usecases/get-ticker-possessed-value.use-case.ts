import { UseCase } from '../base/use-case';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { TransactionRepository } from '../domain/repository/transaction.repository';
import { TickerRepository } from '../domain/repository/ticker.repository';
import { TransactionType } from '../domain/type/TransactionType';
import { PortfolioNotFoundError } from '../domain/error/PortfolioNotFoundError';
import { TickerNotFoundError } from '../domain/error/TickerNotFoundError';

export type GetTickerPossessedValueCommand = {
  userId: string;
  tickerId: string;
};

export type GetTickerPossessedValueResult = {
  tickerId: string;
  shares: number;
  amount: number;
};

export class GetTickerPossessedValueUseCase
  implements
    UseCase<GetTickerPossessedValueCommand, GetTickerPossessedValueResult>
{
  constructor(
    private readonly userPortfolioRepository: UserPortfolioRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(
    command: GetTickerPossessedValueCommand,
  ): Promise<GetTickerPossessedValueResult> {
    const portfolio = await this.userPortfolioRepository.findByUserId(
      command.userId,
    );
    if (!portfolio) {
      throw new PortfolioNotFoundError('Portfolio not found');
    }

    const ticker = await this.tickerRepository.findById(command.tickerId);
    if (!ticker) {
      throw new TickerNotFoundError('Ticker not found');
    }

    const transactions =
      await this.transactionRepository.findByPortfolioIdAndTickerId(
        portfolio.id,
        command.tickerId,
      );

    let totalShares = 0;
    let totalAmount = 0;

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.BUY) {
        totalShares += transaction.volume;
        totalAmount += transaction.amount;
      } else if (transaction.type === TransactionType.SELL) {
        totalShares -= transaction.volume;
        totalAmount -= transaction.amount;
      }
    }

    return {
      tickerId: command.tickerId,
      shares: totalShares,
      amount: totalAmount,
    };
  }
}
