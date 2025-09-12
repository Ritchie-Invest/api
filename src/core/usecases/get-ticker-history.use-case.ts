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

    let processedHistory = history.reverse();
    if (limit > 90) {
      processedHistory = this.aggregateMonthly(processedHistory);
    } else if (limit > 30) {
      processedHistory = this.aggregateWeekly(processedHistory);
    }

    let variation = 0;
    let variationPercent = 0;
    let variationDirection: VariationDirection = VariationDirection.FLAT;

    if (processedHistory.length >= 2) {
      const newest = processedHistory[processedHistory.length - 1]!.close;
      const oldest = processedHistory[0]!.close;
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
      history: processedHistory,
      variation,
      variationPercent,
      variationDirection,
    };
  }

  private aggregateWeekly(history: DailyBar[]): DailyBar[] {
    return this.aggregateBars(history, 7);
  }

  private aggregateMonthly(history: DailyBar[]): DailyBar[] {
    return this.aggregateBars(history, 30);
  }

  private aggregateBars(history: DailyBar[], chunkSize: number): DailyBar[] {
    if (history.length === 0) return [];

    const aggregated: DailyBar[] = [];
    for (let i = 0; i < history.length; i += chunkSize) {
      const chunk = history.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        const aggregatedBar = this.aggregateChunk(chunk);
        aggregated.push(aggregatedBar);
      }
    }

    return aggregated;
  }

  private aggregateChunk(chunk: DailyBar[]): DailyBar {
    const first = chunk[0]!;
    const last = chunk[chunk.length - 1]!;

    const open = first.open;
    const close = last.close;
    const high = Math.max(...chunk.map(b => b.high));
    const low = Math.min(...chunk.map(b => b.low));
    const volume = chunk.reduce((sum, b) => sum + b.volume, 0);
    const timestamp = last.timestamp;
    const tickerId = last.tickerId;
    const id = `agg-${timestamp.getTime()}`;

    return new DailyBar({
      id,
      tickerId,
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
  }
}

function roundTo(n: number, decimals = 2): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}
