import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { PortfolioPositionRepository } from '../domain/repository/portfolio-position.repository';
import { InvalidUserError } from '../domain/error/InvalidUserError';
import { PortfolioPosition } from '../domain/model/PortfolioPosition';
import { PortfolioNotFoundError } from '../domain/error/PortfolioNotFoundError';

export type GetPortfolioPositionsCommand = {
  userId: string;
  limit?: number;
  offset?: number;
};

export type GetPortfolioPositionsResult = {
  positions: PortfolioPosition[];
  total: number;
};

@Injectable()
export class GetPortfolioPositionsUseCase
  implements UseCase<GetPortfolioPositionsCommand, GetPortfolioPositionsResult>
{
  constructor(
    private readonly userPortfolioRepository: UserPortfolioRepository,
    private readonly portfolioPositionRepository: PortfolioPositionRepository,
  ) {}

  async execute(
    command: GetPortfolioPositionsCommand,
  ): Promise<GetPortfolioPositionsResult> {
    if (!command.userId) {
      throw new InvalidUserError('User ID is required');
    }

    const userPortfolio = await this.userPortfolioRepository.findByUserId(
      command.userId,
    );

    if (!userPortfolio) {
      throw new PortfolioNotFoundError('Portfolio not found for this user');
    }

    const positions =
      await this.portfolioPositionRepository.findAllByPortfolioId(
        userPortfolio.id,
        command.limit,
        command.offset,
      );

    const total = await this.portfolioPositionRepository.countByPortfolioId(
      userPortfolio.id,
    );

    return {
      positions,
      total,
    };
  }
}
