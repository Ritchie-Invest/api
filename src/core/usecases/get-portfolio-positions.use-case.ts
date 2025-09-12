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

    let positions =
      await this.portfolioPositionRepository.findAllByPortfolioId(
        userPortfolio.id,
        command.limit,
      );

    if (command.limit && command.limit > 90) {
      positions = this.aggregateMonthly(positions);
    } else if (command.limit && command.limit > 30) {
      positions = this.aggregateWeekly(positions);
    }

    const total = await this.portfolioPositionRepository.countByPortfolioId(
      userPortfolio.id,
    );

    return {
      positions,
      total,
    };
  }

  private aggregateWeekly(positions: PortfolioPosition[]): PortfolioPosition[] {
    return this.aggregatePositions(positions, 7);
  }

  private aggregateMonthly(positions: PortfolioPosition[]): PortfolioPosition[] {
    return this.aggregatePositions(positions, 30);
  }

  private aggregatePositions(positions: PortfolioPosition[], chunkSize: number): PortfolioPosition[] {
    if (positions.length === 0) return [];

    const reversed = [...positions].reverse();

    const aggregated: PortfolioPosition[] = [];
    for (let i = 0; i < reversed.length; i += chunkSize) {
      const chunk = reversed.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        const aggregatedPosition = this.aggregateChunk(chunk);
        aggregated.push(aggregatedPosition);
      }
    }

    return aggregated.reverse();
  }

  private aggregateChunk(chunk: PortfolioPosition[]): PortfolioPosition {
    const last = chunk[chunk.length - 1]!;
    const portfolioId = last.portfolioId;
    const id = `agg-${last.date.getTime()}`;

    return new PortfolioPosition({
      id,
      portfolioId,
      cash: last.cash,
      investments: last.investments,
      date: last.date,
    });
  }
}
