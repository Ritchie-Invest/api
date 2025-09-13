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
import { PortfolioPositionNotFoundError } from '../domain/error/PortfolioPositionNotFoundError';
import { PortfolioPositionRepository } from '../domain/repository/portfolio-position.repository';

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
    private readonly PortfolioPositionRepository: PortfolioPositionRepository,
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
    let sharePrice: number;
    if (dailyBar) {
      sharePrice = dailyBar.close;
    } else {
      const latestDailyBar =
        await this.dailyBarRepository.findLatestByTickerId(tickerId);
      if (!latestDailyBar) {
        throw new DailyBarNotFoundError(
          `No daily bar found for ticker ${tickerId}`,
        );
      }
      sharePrice = latestDailyBar.close;
    }
    const sharesToTrade = amount / sharePrice;

    const lastPosition =
      await this.PortfolioPositionRepository.findLatestByPortfolioId(
        portfolioId,
      );
    if (!lastPosition) {
      throw new PortfolioPositionNotFoundError(
        `No portfolio position found for portfolio ${portfolioId}`,
      );
    }

    const calculateCurrentHoldings = async (
      portfolioId: string,
      tickerId: string,
      price: number,
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

      return totalShares * price;
    };

    const calculateInvestments = async (
      portfolioId: string,
    ): Promise<number> => {
      const transactions =
        await this.transactionRepository.findByPortfolioId(portfolioId);

      if (!transactions || transactions.length === 0) {
        return 0;
      }

      const volumesByTicker: Record<string, number> = {};
      for (const t of transactions) {
        const sign = t.type === TransactionType.BUY ? 1 : -1;
        volumesByTicker[t.tickerId] =
          (volumesByTicker[t.tickerId] ?? 0) + sign * (t.volume ?? 0);
      }

      let total = 0;
      for (const tickerId of Object.keys(volumesByTicker)) {
        const volume = volumesByTicker[tickerId] ?? 0;
        if (!volume) continue;

        const dailyBar =
          await this.dailyBarRepository.findLatestByTickerId(tickerId);
        total += volume * (dailyBar?.close ?? 0);
      }

      return total;
    };

    const currentHoldings = await calculateCurrentHoldings(
      portfolioId,
      tickerId,
      sharePrice,
    );

    if (type === TransactionType.BUY) {
      if (lastPosition.cash < amount) {
        throw new InsufficientCashError(
          `Insufficient cash: required ${amount}, available ${lastPosition.cash}`,
        );
      }

      await this.transactionRepository.create({
        portfolioId,
        tickerId,
        type,
        amount,
        volume: sharesToTrade,
        currentTickerPrice: sharePrice,
      });

      const newInvestments = await calculateInvestments(portfolioId);
      const newCash = lastPosition.cash - amount;

      const createdPosition = await this.PortfolioPositionRepository.create({
        portfolioId,
        date: today,
        cash: newCash,
        investments: newInvestments,
      });

      const newTickerHoldings = await calculateCurrentHoldings(
        portfolioId,
        tickerId,
        sharePrice,
      );

      return {
        cash: createdPosition.cash,
        investments: createdPosition.investments,
        tickerHoldings: newTickerHoldings,
      };
    }

    if (currentHoldings < amount) {
      throw new InsufficientHoldingsError(
        `Insufficient shares for ${ticker.symbol}: required ${amount}, available ${currentHoldings}`,
      );
    }

    await this.transactionRepository.create({
      portfolioId,
      tickerId,
      type,
      amount,
      volume: sharesToTrade,
      currentTickerPrice: sharePrice,
    });

    const newInvestmentsSell = await calculateInvestments(portfolioId);
    const newCashSell = lastPosition.cash + amount;

    const createdPositionSell = await this.PortfolioPositionRepository.create({
      portfolioId,
      date: today,
      cash: newCashSell,
      investments: newInvestmentsSell,
    });

    const newTickerHoldingsSell = await calculateCurrentHoldings(
      portfolioId,
      tickerId,
      sharePrice,
    );

    return {
      cash: createdPositionSell.cash,
      investments: createdPositionSell.investments,
      tickerHoldings: newTickerHoldingsSell,
    };
  }
}
