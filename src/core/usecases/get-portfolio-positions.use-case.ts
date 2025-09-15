import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { PortfolioPositionRepository } from '../domain/repository/portfolio-position.repository';
import { InvalidUserError } from '../domain/error/InvalidUserError';
import { PortfolioPosition } from '../domain/model/PortfolioPosition';
import { PortfolioNotFoundError } from '../domain/error/PortfolioNotFoundError';
import { VariationDirection } from '../domain/type/VariationDirection';

export type GetPortfolioPositionsCommand = {
  userId: string;
  limit?: number;
};

export type GetPortfolioPositionsResult = {
  positions: PortfolioPosition[];
  variation: number;
  variationPercent: number;
  variationDirection: VariationDirection;
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

    const fetched = await this.portfolioPositionRepository.findAllByPortfolioId(
      userPortfolio.id,
      command.limit,
    );

    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`;

    let positions: PortfolioPosition[] = [];
    if (!fetched || fetched.length === 0) {
      positions = [];
    } else {
      const daySet = new Set(fetched.map((p) => dayKey(p.date)));
      if (daySet.size === 1) {
        positions = fetched.slice().reverse();
      } else {
        const seen = new Set<string>();
        const latestPerDay: PortfolioPosition[] = [];
        for (const p of fetched) {
          const k = dayKey(p.date);
          if (!seen.has(k)) {
            latestPerDay.push(p);
            seen.add(k);
          }
        }
        positions = latestPerDay.slice().reverse();
      }
    }

    if (positions.length > 90) {
      positions = this.aggregateMonthly(positions);
    } else if (positions.length > 30) {
      positions = this.aggregateWeekly(positions);
    }

    const total = await this.portfolioPositionRepository.countByPortfolioId(
      userPortfolio.id,
    );

    let variation = 0;
    let variationPercent = 0;
    let variationDirection: VariationDirection = VariationDirection.FLAT;

    if (positions.length >= 2) {
      const oldest = positions[0]!;
      const newest = positions[positions.length - 1]!;
      const oldestValue = (oldest.investments ?? 0) + (oldest.cash ?? 0);
      const latestValue = (newest.investments ?? 0) + (newest.cash ?? 0);
      const delta = latestValue - oldestValue;
      variation = roundTo(delta, 2);
      variationPercent =
        oldestValue !== 0 ? roundTo((delta / oldestValue) * 100, 2) : 0;
      variationDirection =
        delta > 0
          ? VariationDirection.UP
          : delta < 0
            ? VariationDirection.DOWN
            : VariationDirection.FLAT;
    }

    return {
      positions,
      total,
      variation,
      variationPercent,
      variationDirection,
    };
  }

  private aggregateWeekly(positions: PortfolioPosition[]): PortfolioPosition[] {
    return this.aggregatePositions(positions, 7);
  }

  private aggregateMonthly(
    positions: PortfolioPosition[],
  ): PortfolioPosition[] {
    return this.aggregatePositions(positions, 30);
  }

  private aggregatePositions(
    positions: PortfolioPosition[],
    chunkSize: number,
  ): PortfolioPosition[] {
    if (positions.length === 0) return [];

    const aggregated: PortfolioPosition[] = [];
    for (let i = 0; i < positions.length; i += chunkSize) {
      const chunk = positions.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        const aggregatedPosition = this.aggregateChunk(chunk);
        aggregated.push(aggregatedPosition);
      }
    }

    return aggregated;
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

function roundTo(n: number, decimals = 2): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}
