import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { PortfolioPositionRepository } from '../domain/repository/portfolio-position.repository';
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
    private readonly PortfolioPositionRepository: PortfolioPositionRepository,
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
    let latestPortfolioPosition =
      await this.PortfolioPositionRepository.findByPortfolioIdAndDate(
        userPortfolio.id,
        today,
      );

    if (!latestPortfolioPosition) {
      latestPortfolioPosition =
        await this.PortfolioPositionRepository.findLatestByPortfolioId(
          userPortfolio.id,
        );
    }

    const cash = latestPortfolioPosition?.cash || 0;
    const investments = latestPortfolioPosition?.investments || 0;
    const totalValue = cash + investments;

    return {
      currency: userPortfolio.currency,
      cash,
      investments,
      totalValue,
    };
  }
}
