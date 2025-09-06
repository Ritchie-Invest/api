import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { PortfolioValueRepository } from '../domain/repository/portfolio-value.repository';
import { InvalidUserError } from '../domain/error/InvalidUserError';
import { Currency } from '../domain/type/Currency';

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
    private readonly portfolioValueRepository: PortfolioValueRepository,
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
    let latestPortfolioValue =
      await this.portfolioValueRepository.findByPortfolioIdAndDate(
        userPortfolio.id,
        today,
      );

    if (!latestPortfolioValue) {
      latestPortfolioValue =
        await this.portfolioValueRepository.findLatestByPortfolioId(
          userPortfolio.id,
        );
    }

    const cash = latestPortfolioValue?.cash || 0;
    const investments = latestPortfolioValue?.investments || 0;
    const totalValue = cash + investments;

    return {
      currency: userPortfolio.currency,
      cash,
      investments,
      totalValue,
    };
  }
}
