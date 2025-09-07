import { UseCase } from '../base/use-case';
import { TickerRepository } from '../domain/repository/ticker.repository';
import { TickerType } from '../domain/type/TickerType';
import { Currency } from '../domain/type/Currency';
import { EmptyTickerHistoryError } from '../domain/error/EmptyTickerHistoryError';
import { VariationDirection } from '../domain/type/VariationDirection';

export type GetTickersWithPriceCommand = Record<string, never>;

export type TickerWithPrice = {
  id: string;
  name: string;
  symbol: string;
  type: TickerType;
  currency: Currency;
  price: number;
  variation: number;
  variationPercent: number;
  variationDirection: VariationDirection;
};

export class GetTickersWithPriceUseCase
  implements UseCase<GetTickersWithPriceCommand, TickerWithPrice[]>
{
  constructor(private readonly tickerRepository: TickerRepository) {}

  async execute(): Promise<TickerWithPrice[]> {
    const tickers = await this.tickerRepository.findAll();

    return tickers
      .map((t) => {
        if (!t) return null;
        try {
          const priceRaw = t.price;
          const history = t.history;
          let variation = 0;
          let variationPercent = 0;
          let variationDirection: VariationDirection = VariationDirection.FLAT;
          if (history.length >= 2) {
            const current = history[history.length - 1]!.close;
            const previous = history[history.length - 2]!.close;
            const delta = current - previous;
            variation = roundTo(delta, 2);
            variationPercent =
              previous !== 0 ? roundTo((delta / previous) * 100, 2) : 0;
            variationDirection =
              delta > 0
                ? VariationDirection.UP
                : delta < 0
                  ? VariationDirection.DOWN
                  : VariationDirection.FLAT;
          }
          return {
            id: t.id,
            name: t.name,
            symbol: t.symbol,
            type: t.type,
            currency: t.currency,
            price: roundTo(priceRaw, 2),
            variation,
            variationPercent,
            variationDirection,
          };
        } catch (e) {
          if (e instanceof EmptyTickerHistoryError) {
            // Ignore tickers without history
            return null;
          }
          throw e;
        }
      })
      .filter((item): item is TickerWithPrice => item !== null);
  }
}

function roundTo(n: number, decimals = 2): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}
