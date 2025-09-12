import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { PortfolioPositionRepository } from '../domain/repository/portfolio-position.repository';
import { TransactionRepository } from '../domain/repository/transaction.repository';
import { DailyBarRepository } from '../domain/repository/daily-bar.repository';
import { InvalidUserError } from '../domain/error/InvalidUserError';
import { Currency } from '../domain/type/Currency';
import { TransactionType } from '../domain/type/TransactionType';

export type GetPortfolioCommand = {
  userId: string;
};

export type GetPortfolioResult = {
  currency: Currency;
  cash: number;
  investments: number;
  totalValue: number;
};

@Injectable()
export class GetPortfolioUseCase
  implements UseCase<GetPortfolioCommand, GetPortfolioResult>
{
  constructor(
    private readonly userPortfolioRepository: UserPortfolioRepository,
    private readonly portfolioPositionRepository: PortfolioPositionRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly dailyBarRepository: DailyBarRepository,
  ) {}

  async execute(command: GetPortfolioCommand): Promise<GetPortfolioResult> {
    if (!command.userId) {
      throw new InvalidUserError('User ID is required');
    }

    const userPortfolio = await this.userPortfolioRepository.findByUserId(
      command.userId,
    );

    if (!userPortfolio) {
      throw new InvalidUserError('Portfolio not found for this user');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const latestPortfolioPosition =
      await this.portfolioPositionRepository.findByPortfolioIdAndDate(
        userPortfolio.id,
        today,
      );

    const cash = latestPortfolioPosition?.cash || 0;

    const investments = await this.calculateInvestments(userPortfolio.id);

    const totalValue = cash + investments;

    return {
      currency: userPortfolio.currency,
      cash,
      investments,
      totalValue,
    };
  }

  private async calculateInvestments(
    portfolioId: string,
  ): Promise<number> {
    const transactions = await this.transactionRepository.findByPortfolioId(
      portfolioId,
    );

    if (!transactions || transactions.length === 0) {
      return 0;
    }

    const volumesByTicker: Record<string, number> = {};
    for (const t of transactions) {
      const sign = t.type === TransactionType.BUY ? 1 : -1;
      volumesByTicker[t.tickerId] = (volumesByTicker[t.tickerId] ?? 0) + sign * (t.volume ?? 0);
    }

    let total = 0;
    for (const tickerId of Object.keys(volumesByTicker)) {
      const volume = volumesByTicker[tickerId] ?? 0;
      if (!volume) continue;

      const dailyBar = await this.dailyBarRepository.findLatestByTickerId(
        tickerId,
      );
      total += volume * (dailyBar?.close ?? 0);
    }

    return total;
  }
}
