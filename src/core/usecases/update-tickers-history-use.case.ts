import { UseCase } from '../base/use-case';
import { TickerRepository } from '../domain/repository/ticker.repository';
import { MarketService } from '../domain/service/market.service';

export class UpdateTickersHistoryUseCase implements UseCase<void, void> {
  constructor(
    private readonly tickerRepository: TickerRepository,
    private readonly marketService: MarketService,
  ) {}

  async execute(): Promise<void> {
    const tickers = await this.tickerRepository.findAll();

    for (const ticker of tickers) {
      const barsFromMarket = await this.marketService.getLatestDailyBars(
        ticker.symbol,
      );

      if (!barsFromMarket || barsFromMarket.length === 0) {
        continue;
      }

      const sortedBars = barsFromMarket.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      );

      await this.tickerRepository.addDailyBars(ticker.id, sortedBars);
    }
  }
}
