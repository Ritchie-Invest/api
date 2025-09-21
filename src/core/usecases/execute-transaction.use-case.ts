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

    const sharePrice = await ExecuteTransactionUseCase.findSharePrice(
      this.dailyBarRepository,
      tickerId,
    );

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

    const result =
      await ExecuteTransactionUseCase.executeTransactionAndSavePosition(
        this.transactionRepository,
        this.dailyBarRepository,
        this.PortfolioPositionRepository,
        portfolioId,
        tickerId,
        type,
        amount,
        sharesToTrade,
        sharePrice,
        lastPosition,
        ticker,
      );
    return result;
  }

  private static async calculateCurrentHoldings(
    transactionRepository: TransactionRepository,
    portfolioId: string,
    tickerId: string,
    price: number,
  ): Promise<number> {
    const transactions =
      await transactionRepository.findByPortfolioIdAndTickerId(
        portfolioId,
        tickerId,
      );
    let totalShares = 0;

    for (const t of transactions) {
      if (t.type === TransactionType.BUY) {
        totalShares += t.volume ?? 0;
      } else {
        totalShares -= t.volume ?? 0;
      }
    }

    return totalShares * price;
  }

  private static async calculateInvestments(
    transactionRepository: TransactionRepository,
    dailyBarRepository: DailyBarRepository,
    portfolioId: string,
  ): Promise<number> {
    const transactions =
      await transactionRepository.findByPortfolioId(portfolioId);

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

      const price = await ExecuteTransactionUseCase.findSharePrice(
        dailyBarRepository,
        tickerId,
      );
      total += volume * price;
    }

    return total;
  }

  private static async findSharePrice(
    dailyBarRepository: DailyBarRepository,
    tickerId: string,
  ): Promise<number> {
    const dailyBar = await dailyBarRepository.findByTickerIdAndDate(
      tickerId,
      new Date(),
    );

    if (dailyBar) {
      return dailyBar.close;
    }

    const latestDailyBar =
      await dailyBarRepository.findLatestByTickerId(tickerId);
    if (!latestDailyBar) {
      throw new DailyBarNotFoundError(
        `No daily bar found for ticker ${tickerId}`,
      );
    }
    return latestDailyBar.close;
  }

  private static async executeTransactionAndSavePosition(
    transactionRepository: TransactionRepository,
    dailyBarRepository: DailyBarRepository,
    portfolioPositionRepository: PortfolioPositionRepository,
    portfolioId: string,
    tickerId: string,
    type: TransactionType,
    amount: number,
    sharesToTrade: number,
    sharePrice: number,
    lastPosition: { cash: number },
    ticker: { symbol: string },
  ): Promise<ExecuteTransactionResult> {
    if (type === TransactionType.BUY) {
      if (lastPosition.cash < amount) {
        throw new InsufficientCashError(
          `Insufficient cash: required ${amount}, available ${lastPosition.cash}`,
        );
      }
    }

    const currentHoldings =
      await ExecuteTransactionUseCase.calculateCurrentHoldings(
        transactionRepository,
        portfolioId,
        tickerId,
        sharePrice,
      );

    if (type === TransactionType.SELL) {
      if (currentHoldings < amount) {
        throw new InsufficientHoldingsError(
          `Insufficient shares for ${ticker.symbol}: required ${amount}, available ${currentHoldings}`,
        );
      }
    }

    await transactionRepository.create({
      portfolioId,
      tickerId,
      type,
      amount,
      volume: sharesToTrade,
      currentTickerPrice: sharePrice,
    });

    const newInvestments = await ExecuteTransactionUseCase.calculateInvestments(
      transactionRepository,
      dailyBarRepository,
      portfolioId,
    );

    const newCash =
      type === TransactionType.BUY
        ? lastPosition.cash - amount
        : lastPosition.cash + amount;

    const newPosition = await portfolioPositionRepository.create({
      portfolioId,
      date: new Date(),
      cash: newCash,
      investments: newInvestments,
    });

    const NewPositionValues = newPosition as {
      cash: number;
      investments: number;
    };

    const newTickerHoldings =
      await ExecuteTransactionUseCase.calculateCurrentHoldings(
        transactionRepository,
        portfolioId,
        tickerId,
        sharePrice,
      );

    return {
      cash: NewPositionValues.cash,
      investments: NewPositionValues.investments,
      tickerHoldings: newTickerHoldings,
    };
  }
}
