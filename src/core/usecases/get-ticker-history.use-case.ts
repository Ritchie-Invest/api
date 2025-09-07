import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { DailyBarRepository } from '../domain/repository/daily-bar.repository';
import { DailyBar } from '../domain/model/DailyBar';
import { InvalidHistoryLimitError } from '../domain/error/InvalidHistoryLimitError';
import { VariationDirection } from '../domain/type/VariationDirection';

export type GetTickerHistoryCommand = {
  tickerId: string;
  limit: number;
};

export type GetTickerHistoryResult = {
  history: DailyBar[];
  variation: number;
  variationPercent: number;
  variationDirection: VariationDirection;
};

@Injectable()
export class GetTickerHistoryUseCase
  implements UseCase<GetTickerHistoryCommand, GetTickerHistoryResult>
{
  constructor(
    @Inject('DailyBarRepository')
    private readonly dailyBarRepository: DailyBarRepository,
  ) {}

  async execute(
    command: GetTickerHistoryCommand,
  ): Promise<GetTickerHistoryResult> {
    const { tickerId, limit } = command;

    if (limit <= 0) {
      throw new InvalidHistoryLimitError('Limit must be greater than 0');
    }

    if (limit > 365) {
      throw new InvalidHistoryLimitError('Limit cannot exceed 365 days');
    }

    const history = await this.dailyBarRepository.findByTickerIdWithLimit(
      tickerId,
      limit,
    );

    let variation = 0;
    let variationPercent = 0;
    let variationDirection: VariationDirection = VariationDirection.FLAT;

    if (history.length >= 2) {
      const newest = history[0]!.close;
      const oldest = history[history.length - 1]!.close;
      const delta = newest - oldest;

      variation = roundTo(delta, 2);
      variationPercent = oldest !== 0 ? roundTo((delta / oldest) * 100, 2) : 0;
      variationDirection =
        delta > 0
          ? VariationDirection.UP
          : delta < 0
            ? VariationDirection.DOWN
            : VariationDirection.FLAT;
    }
    return {
      history,
      variation,
      variationPercent,
      variationDirection,
    };
  }
}

function roundTo(n: number, decimals = 2): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}
