import { Repository } from '../../base/repository';
import { DailyBar } from '../model/DailyBar';

export abstract class DailyBarRepository extends Repository<DailyBar> {
  abstract findByTickerIdAndDate(tickerId: string, date: Date): Promise<DailyBar | null> | DailyBar | null;
}