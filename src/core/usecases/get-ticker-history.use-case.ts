import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { DailyBarRepository } from '../domain/repository/daily-bar.repository';
import { DailyBar } from '../domain/model/DailyBar';
import { InvalidHistoryLimitError } from '../domain/error/InvalidHistoryLimitError';

export type GetTickerHistoryCommand = {
  tickerId: string;
  limit: number;
};

export type GetTickerHistoryResult = {
  history: DailyBar[];
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

    return {
      history,
    };
  }
}
