import { GetUserTickersResult, UserTickerResult } from '../../../core/usecases/get-user-tickers.use-case';
import { GetUserTickersResponse, UserTickerDto } from '../response/get-user-tickers.response';

export class GetUserTickersMapper {
  static fromDomain(result: GetUserTickersResult): GetUserTickersResponse {
    return {
      tickers: result.tickers.map(this.mapUserTicker),
    };
  }

  private static mapUserTicker(ticker: UserTickerResult): UserTickerDto {
    return {
      id: ticker.id,
      name: ticker.name,
      symbol: ticker.symbol,
      shares: ticker.shares,
      amount: ticker.amount,
    };
  }
}
