import { Repository } from '../../base/repository';
import { Ticker } from '../model/Ticker';

export abstract class TickerRepository extends Repository<Ticker> {
  abstract findBySymbol(symbol: string): Promise<Ticker | null> | Ticker | null;
}
