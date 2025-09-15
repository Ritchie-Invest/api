import { Repository } from '../../base/repository';
import { Ticker } from '../model/Ticker';
import { DailyBar } from '../model/DailyBar';

export abstract class TickerRepository extends Repository<Ticker> {
  abstract findBySymbol(symbol: string): Promise<Ticker | null> | Ticker | null;
  abstract addDailyBars(
    tickerId: string,
    bars: DailyBar[],
  ): Promise<void> | void;
}
