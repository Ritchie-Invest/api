import { UseCase } from '../base/use-case';
import { Transaction } from '../domain/model/Transaction';
import { Ticker } from '../domain/model/Ticker';
import { TransactionRepository } from '../domain/repository/transaction.repository';
import { TickerRepository } from '../domain/repository/ticker.repository';

export type GetUserTransactionsCommand = {
  portfolioId: string;
  limit?: number;
};

export type GetUserTransactionsResult = {
  transactions: {
    tickerName: string;
    tickerSymbol: string;
    type: Transaction['type'];
    amount: number;
    volume: number;
    timestamp: Date;
  }[];
};

export class GetUserTransactionsUseCase
  implements UseCase<GetUserTransactionsCommand, GetUserTransactionsResult>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(
    command: GetUserTransactionsCommand,
  ): Promise<GetUserTransactionsResult> {
    let transactions = await this.transactionRepository.findByPortfolioId(
      command.portfolioId,
      command.limit,
    );
    transactions = transactions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    const tickerIds = [...new Set(transactions.map((t) => t.tickerId))];
    const tickers = await Promise.all(
      tickerIds.map((id) => this.tickerRepository.findById(id)),
    );
    const tickerMap = new Map<string, Ticker>();
    tickers.forEach((ticker) => {
      if (ticker) tickerMap.set(ticker.id, ticker);
    });

    const enrichedTransactions = transactions.map((t) => {
      const ticker = tickerMap.get(t.tickerId);
      return {
        tickerName: ticker?.name || 'Unknown',
        tickerSymbol: ticker?.symbol || 'UNKNOWN',
        type: t.type,
        amount: t.amount,
        volume: t.volume,
        timestamp: t.timestamp,
      };
    });

    return { transactions: enrichedTransactions };
  }
}
