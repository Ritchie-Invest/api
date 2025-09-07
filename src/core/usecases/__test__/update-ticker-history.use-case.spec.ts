import { InMemoryTickerRepository } from '../../../adapters/in-memory/in-memory-ticker.repository';
import { UpdateTickersHistoryUseCase } from '../update-tickers-history-use.case';
import { Ticker } from '../../domain/model/Ticker';
import { TickerType } from '../../domain/type/TickerType';
import { Currency } from '../../domain/type/Currency';
import { DailyBar } from '../../domain/model/DailyBar';
import { InMemoryMarketService } from '../../../adapters/in-memory/in-memory-market.service';

describe('UpdateTickerHistoryUseCase', () => {
  let tickerRepository: InMemoryTickerRepository;
  let marketService: InMemoryMarketService;
  let useCase: UpdateTickersHistoryUseCase;

  beforeEach(() => {
    tickerRepository = new InMemoryTickerRepository();
    marketService = new InMemoryMarketService();

    useCase = new UpdateTickersHistoryUseCase(tickerRepository, marketService);

    tickerRepository.removeAll();
  });

  it('should insert new daily bars and deduplicate by date', async () => {
    // Given
    const ticker1 = new Ticker({
      id: 'ticker-1',
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
      history: [],
    });
    tickerRepository.create(ticker1);
    const bar1 = new DailyBar({
      id: 'bar-1',
      tickerId: 'ticker-1',
      timestamp: new Date('2024-01-01'),
      open: 470,
      high: 472,
      low: 468,
      close: 471,
      volume: 1000,
    });
    const bar2 = new DailyBar({
      id: 'bar-2',
      tickerId: 'ticker-1',
      timestamp: new Date('2024-01-02'),
      open: 471,
      high: 475,
      low: 470,
      close: 474,
      volume: 1200,
    });
    marketService.given('SPY', [bar1, bar2]);

    const ticker2 = new Ticker({
      id: 'ticker-2',
      name: 'Euro Stoxx 50',
      symbol: 'SX5E',
      type: TickerType.ETF,
      currency: Currency.EUR,
      history: [],
    });
    tickerRepository.create(ticker2);
    const bar3 = new DailyBar({
      id: 'bar-3',
      tickerId: 'ticker-2',
      timestamp: new Date('2024-01-01'),
      open: 4100,
      high: 4120,
      low: 4080,
      close: 4110,
      volume: 500,
    });
    marketService.given('SX5E', [bar3]);

    // When
    await useCase.execute();

    // Then
    const updatedTicker1 = tickerRepository.findById('ticker-1');
    expect(updatedTicker1).not.toBeNull();
    expect(updatedTicker1!.history.length).toBe(2);
    expect(updatedTicker1!.history[0]!.timestamp.toISOString()).toBe(
      '2024-01-01T00:00:00.000Z',
    );
    expect(updatedTicker1!.history[1]!.timestamp.toISOString()).toBe(
      '2024-01-02T00:00:00.000Z',
    );
    const updatedTicker2 = tickerRepository.findById('ticker-2');
    expect(updatedTicker2).not.toBeNull();
    expect(updatedTicker2!.history.length).toBe(1);
    expect(updatedTicker2!.history[0]!.timestamp.toISOString()).toBe(
      '2024-01-01T00:00:00.000Z',
    );
  });

  it('should prevent history duplication', async () => {
    // Given
    const ticker1 = new Ticker({
      id: 'ticker-1',
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
      history: [
        new DailyBar({
          id: 'existing-bar',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-01'),
          open: 470,
          high: 472,
          low: 468,
          close: 471,
          volume: 1000,
        }),
      ],
    });
    tickerRepository.create(ticker1);
    const bar1 = new DailyBar({
      id: 'bar-1',
      tickerId: 'ticker-1',
      timestamp: new Date('2024-01-01'),
      open: 470,
      high: 472,
      low: 468,
      close: 471,
      volume: 1000,
    });
    const bar2 = new DailyBar({
      id: 'bar-2',
      tickerId: 'ticker-1',
      timestamp: new Date('2024-01-02'),
      open: 471,
      high: 475,
      low: 470,
      close: 474,
      volume: 1200,
    });
    marketService.given('SPY', [bar1, bar2]);

    // When
    await useCase.execute();

    // Then
    const updatedTicker1 = tickerRepository.findById('ticker-1');
    expect(updatedTicker1).not.toBeNull();
    expect(updatedTicker1!.history.length).toBe(2);
    expect(updatedTicker1!.history[0]!.id).toBe('existing-bar');
    expect(updatedTicker1!.history[1]!.id).toBe('bar-2');
  });

  it('should be a no-op when market returns no bars', async () => {
    // Given
    const ticker = new Ticker({
      id: 'ticker-2',
      name: 'Empty',
      symbol: 'EMPTY',
      type: TickerType.ETF,
      currency: Currency.USD,
      history: [],
    });
    tickerRepository.create(ticker);

    // When
    await useCase.execute();

    // Then
    const updated = tickerRepository.findById('ticker-2');
    expect(updated).not.toBeNull();
    expect(updated!.history.length).toBe(0);
  });
});
