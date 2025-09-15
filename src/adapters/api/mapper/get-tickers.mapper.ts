import {
  GetTickersResponse,
  TickerResponse,
} from '../response/get-tickers.response';
import { TickerWithPrice } from '../../../core/usecases/get-tickers-with-price.use-case';

export class GetTickersMapper {
  static fromDomain(tickers: TickerWithPrice[]): GetTickersResponse {
    return new GetTickersResponse(
      tickers.map(
        (ticker) =>
          new TickerResponse({
            id: ticker.id,
            name: ticker.name,
            symbol: ticker.symbol,
            type: ticker.type,
            currency: ticker.currency,
            price: ticker.price,
            variation: ticker.variation,
            variationPercent: ticker.variationPercent,
            variationDirection: ticker.variationDirection,
          }),
      ),
    );
  }
}
