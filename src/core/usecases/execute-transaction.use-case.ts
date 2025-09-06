import { UseCase } from '../base/use-case';
import { TransactionType } from '../domain/type/TransactionType';
import { TransactionRepository } from '../domain/repository/transaction.repository';
import { DailyBarRepository } from '../domain/repository/daily-bar.repository';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { TickerRepository } from '../domain/repository/ticker.repository';
import { DailyBarNotFoundError } from '../domain/error/DailyBarNotFoundError';
import { InsufficientCashError } from '../domain/error/InsufficientCashError';
import { InsufficientHoldingsError } from '../domain/error/InsufficientHoldingsError';
import { PortfolioNotFoundError } from '../domain/error/PortfolioNotFoundError';
import { TickerNotFoundError } from '../domain/error/TickerNotFoundError';
import { PortfolioValueNotFoundError } from '../domain/error/PortfolioValueNotFoundError';
import { PortfolioValueRepository } from '../domain/repository/portfolio-value.repository';

export type ExecuteTransactionCommand = {
  portfolioId: string;
  tickerId: string;
  type: TransactionType;
  amount: number;
};

export type ExecuteTransactionResult = {
  cash: number;
  investments: number;
  tickerHoldings: number;
};

export class ExecuteTransactionUseCase
  implements UseCase<ExecuteTransactionCommand, ExecuteTransactionResult>
{
  constructor(
    private readonly userPortfolioRepository: UserPortfolioRepository,
    private readonly tickerRepository: TickerRepository,
    private readonly dailyBarRepository: DailyBarRepository,
    private readonly portfolioValueRepository: PortfolioValueRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    command: ExecuteTransactionCommand,
  ): Promise<ExecuteTransactionResult> {
    const { portfolioId, tickerId, type, amount } = command;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const portfolio = await this.userPortfolioRepository.findById(portfolioId);
    if (!portfolio) {
      throw new PortfolioNotFoundError(
        `Portfolio with id ${portfolioId} not found`,
      );
    }

    const ticker = await this.tickerRepository.findById(tickerId);
    if (!ticker) {
      throw new TickerNotFoundError(`Ticker with id ${tickerId} not found`);
    }

    const dailyBar = await this.dailyBarRepository.findByTickerIdAndDate(
      tickerId,
      today,
    );
    if (!dailyBar) {
      throw new DailyBarNotFoundError(
        `Daily bar not found for ticker ${tickerId} on date ${today.toISOString()}`,
      );
    }

    const portfolioValue =
      await this.portfolioValueRepository.findByPortfolioIdAndDate(
        portfolioId,
        today,
      );
    if (!portfolioValue) {
      throw new PortfolioValueNotFoundError(
        `Portfolio amount not found for portfolio ${portfolioId} on date ${today.toISOString()}`,
      );
    }

    const sharePrice = dailyBar.close;
    const sharesToTrade = amount / sharePrice;

    const calculateCurrentHoldings = async (
      portfolioId: string,
      tickerId: string,
    ): Promise<number> => {
      const transactions =
        await this.transactionRepository.findByPortfolioIdAndTickerId(
          portfolioId,
          tickerId,
        );
      let totalShares = 0;

      for (const transaction of transactions) {
        if (transaction.type === TransactionType.BUY) {
          totalShares += transaction.volume;
        } else {
          totalShares -= transaction.volume;
        }
      }

      return totalShares * sharePrice;
    };

    const currentHoldings = await calculateCurrentHoldings(
      portfolioId,
      tickerId,
    );

    if (type === TransactionType.BUY) {
      if (portfolioValue.cash < amount) {
        throw new InsufficientCashError(
          `Insufficient cash: required ${amount}, available ${portfolioValue.cash}`,
        );
      }

      const updatedPortfolioValue = await this.portfolioValueRepository.update(
        portfolioValue.id,
        {
          cash: portfolioValue.cash - amount,
          investments: portfolioValue.investments + amount,
        },
      );

      if (!updatedPortfolioValue) {
        throw new Error('Failed to update portfolio value');
      }

      await this.transactionRepository.create({
        portfolioId,
        tickerId,
        type,
        amount,
        volume: sharesToTrade,
        currentTickerPrice: sharePrice,
      });

      return {
        cash: updatedPortfolioValue.cash,
        investments: updatedPortfolioValue.investments,
        tickerHoldings: currentHoldings + amount,
      };
    } else {
      if (currentHoldings < amount) {
        throw new InsufficientHoldingsError(
          `Insufficient shares for ${ticker.symbol}: required ${amount}, available ${currentHoldings}`,
        );
      }

      const updatedPortfolioValue = await this.portfolioValueRepository.update(
        portfolioValue.id,
        {
          cash: portfolioValue.cash + amount,
          investments: portfolioValue.investments - amount,
        },
      );

      if (!updatedPortfolioValue) {
        throw new Error('Failed to update portfolio value');
      }

      await this.transactionRepository.create({
        portfolioId,
        tickerId,
        type,
        amount,
        volume: sharesToTrade,
        currentTickerPrice: sharePrice,
      });

      return {
        cash: updatedPortfolioValue.cash,
        investments: updatedPortfolioValue.investments,
        tickerHoldings: currentHoldings - amount,
      };
    }
  }
}
