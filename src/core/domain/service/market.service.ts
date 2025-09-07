import { DailyBar } from '../model/DailyBar';

export interface MarketService {
  getLatestDailyBars(symbol: string): Promise<DailyBar[]> | DailyBar[];
}
