import { Injectable } from '@nestjs/common';
import { MarketService } from '../../core/domain/service/market.service';
import { DailyBar } from '../../core/domain/model/DailyBar';
import { TimeSeriesDailyResponse } from './response/TimeSeriesDailyResponse';

@Injectable()
export class AlphaVantageMarketServiceAdapter implements MarketService {
  private readonly baseUrl =
    process.env.ALPHA_VANTAGE_API_URL || 'https://www.alphavantage.co/query';
  private readonly apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

  async getLatestDailyBars(symbol: string): Promise<DailyBar[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('function', 'TIME_SERIES_DAILY');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('apikey', this.apiKey);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return [];
    }

    const json = (await res.json()) as TimeSeriesDailyResponse;

    const series = json['Time Series (Daily)'];
    if (!series) return [];

    return Object.entries(series).map(([date, values]) => {
      const open = parseFloat(values['1. open']);
      const high = parseFloat(values['2. high']);
      const low = parseFloat(values['3. low']);
      const close = parseFloat(values['4. close']);
      const volume = parseInt(values['5. volume'], 10);
      return new DailyBar({
        id: this.generateId(),
        tickerId: '',
        timestamp: new Date(date),
        open,
        high,
        low,
        close,
        volume: Number.isNaN(volume) ? 0 : volume,
      });
    });
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
