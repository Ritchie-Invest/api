import { MarketService } from '../../core/domain/service/market.service';
import { DailyBar } from '../../core/domain/model/DailyBar';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryMarketService implements MarketService {
  private readonly bars = new Map<string, DailyBar[]>();

  given(symbol: string, bars: DailyBar[]): void {
    this.bars.set(symbol, bars);
  }

  getLatestDailyBars(symbol: string): DailyBar[] {
    return this.bars.get(symbol) || [];
  }
}
