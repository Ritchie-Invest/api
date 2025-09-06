import { UseCase } from '../base/use-case';
import { TransactionType } from '../domain/type/TransactionType';
import { TransactionRepository } from '../domain/repository/transaction.repository';
import { PortfolioValueRepository } from '../domain/repository/portfolio-value.repository';
import { PortfolioTickerRepository } from '../domain/repository/portfolio-ticker.repository';
import { DailyBarRepository } from '../domain/repository/daily-bar.repository';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { TickerRepository } from '../domain/repository/ticker.repository';
import { DailyBarNotFoundError } from '../domain/error/DailyBarNotFoundError';
import { InsufficientCashError } from '../domain/error/InsufficientCashError';
import { InsufficientHoldingsError } from '../domain/error/InsufficientHoldingsError';
import { PortfolioNotFoundError } from '../domain/error/PortfolioNotFoundError';
import { TickerNotFoundError } from '../domain/error/TickerNotFoundError';
import { PortfolioValueNotFoundError } from '../domain/error/PortfolioValueNotFoundError';
import { PortfolioTickerNotFoundError } from '../domain/error/PortfolioTickerNotFoundError';

export type ExecuteTransactionCommand = {
  portfolioId: string;
  tickerId: string;
  type: TransactionType;
  value: number;
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
    private readonly portfolioTickerRepository: PortfolioTickerRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    command: ExecuteTransactionCommand,
  ): Promise<ExecuteTransactionResult> {
    const { portfolioId, tickerId, type, value } = command;
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
        `Portfolio value not found for portfolio ${portfolioId} on date ${today.toISOString()}`,
      );
    }

    const portfolioTicker =
      await this.portfolioTickerRepository.findByPortfolioIdTickerIdAndDate(
        portfolioId,
        tickerId,
        today,
      );
    if (!portfolioTicker) {
      throw new PortfolioTickerNotFoundError(
        `Portfolio ticker not found for portfolio ${portfolioId} and ticker ${tickerId} on date ${today.toISOString()}`,
      );
    }

    const sharePrice = dailyBar.close;
    const sharesToTrade = value / sharePrice;

    if (type === TransactionType.Buy) {
      if (portfolioValue.cash < value) {
        throw new InsufficientCashError(
          `Insufficient cash: required ${value}, available ${portfolioValue.cash}`,
        );
      }

      const updatedPortfolioValue = await this.portfolioValueRepository.update(
        portfolioValue.id,
        {
          cash: portfolioValue.cash - value,
          investments: portfolioValue.investments + value,
        },
      );

      const updatedPortfolioTicker =
        await this.portfolioTickerRepository.update(portfolioTicker.id, {
          value: portfolioTicker.value + value,
          shares: portfolioTicker.shares + sharesToTrade,
        });

      await this.transactionRepository.create({
        portfolioId,
        tickerId,
        type,
        value,
      });

      return {
        cash: updatedPortfolioValue.cash,
        investments: updatedPortfolioValue.investments,
        tickerHoldings: updatedPortfolioTicker.value,
      };
    } else {
      if (portfolioTicker.shares < sharesToTrade) {
        throw new InsufficientHoldingsError(
          `Insufficient shares for ${ticker.symbol}: required ${sharesToTrade}, available ${portfolioTicker.shares}`,
        );
      }

      const updatedPortfolioValue = await this.portfolioValueRepository.update(
        portfolioValue.id,
        {
          cash: portfolioValue.cash + value,
          investments: portfolioValue.investments - value,
        },
      );

      const updatedPortfolioTicker =
        await this.portfolioTickerRepository.update(portfolioTicker.id, {
          value: portfolioTicker.value - value,
          shares: portfolioTicker.shares - sharesToTrade,
        });

      await this.transactionRepository.create({
        portfolioId,
        tickerId,
        type,
        value,
      });

      return {
        cash: updatedPortfolioValue.cash,
        investments: updatedPortfolioValue.investments,
        tickerHoldings: updatedPortfolioTicker.value,
      };
    }
  }
}
