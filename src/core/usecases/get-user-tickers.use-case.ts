import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { TransactionRepository } from '../domain/repository/transaction.repository';
import { TickerRepository } from '../domain/repository/ticker.repository';
import { TransactionType } from '../domain/type/TransactionType';
import { TickerType } from '../domain/type/TickerType';
import { PortfolioNotFoundError } from '../domain/error/PortfolioNotFoundError';

export type GetUserTickersCommand = {
  portfolioId: string;
};

export type UserTickerResult = {
  id: string;
  name: string;
  symbol: string;
  shares: number;
  amount: number;
};

export type GetUserTickersResult = {
  tickers: UserTickerResult[];
};

@Injectable()
export class GetUserTickersUseCase
  implements UseCase<GetUserTickersCommand, GetUserTickersResult>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(command: GetUserTickersCommand): Promise<GetUserTickersResult> {
    if (!command.portfolioId) {
      throw new PortfolioNotFoundError('Portfolio ID is required');
    }

    const transactions = await this.transactionRepository.findAll({
      portfolioId: command.portfolioId,
    });

    const tickerPositions = new Map<string, { shares: number; amount: number }>();

    for (const transaction of transactions) {
      const existing = tickerPositions.get(transaction.tickerId) || {
        shares: 0,
        amount: 0,
      };

      if (transaction.type === TransactionType.BUY) {
        existing.shares += transaction.volume;
        existing.amount += transaction.amount;
      } else if (transaction.type === TransactionType.SELL) {
        existing.shares -= transaction.volume;
        existing.amount -= transaction.amount;
      }

      tickerPositions.set(transaction.tickerId, existing);
    }

    const userTickers: UserTickerResult[] = [];

    for (const [tickerId, position] of tickerPositions.entries()) {
      if (position.shares > 0) {
        const ticker = await this.tickerRepository.findById(tickerId);
        if (ticker && ticker.type === TickerType.ETF) {
          userTickers.push({
            id: ticker.id,
            name: ticker.name,
            symbol: ticker.symbol,
            shares: position.shares,
            amount: position.amount,
          });
        }
      }
    }

    return {
      tickers: userTickers,
    };
  }
}
