import { GetTickerHistoryResult as UseCaseResult } from '../../../core/usecases/get-ticker-history.use-case';
import { GetTickerHistoryResponse } from '../response/get-ticker-history.response';
import { DailyBar } from '../../../core/domain/model/DailyBar';

export class GetTickerHistoryMapper {
  static fromDomain(useCaseResult: UseCaseResult): GetTickerHistoryResponse {
    return {
      history: useCaseResult.history.map((dailyBar: DailyBar) => ({
        id: dailyBar.id,
        tickerId: dailyBar.tickerId,
        timestamp: dailyBar.timestamp,
        open: dailyBar.open,
        high: dailyBar.high,
        low: dailyBar.low,
        close: dailyBar.close,
        volume: dailyBar.volume,
      })),
    };
  }
}
