import { InMemoryTickerRepository } from '../../../adapters/in-memory/in-memory-ticker.repository';
import { GetTickersWithPriceUseCase } from '../get-tickers-with-price.use-case';
import { Ticker } from '../../domain/model/Ticker';
import { TickerType } from '../../domain/type/TickerType';
import { Currency } from '../../domain/type/Currency';
import { DailyBar } from '../../domain/model/DailyBar';
import { VariationDirection } from '../../domain/type/VariationDirection';

describe('GetTickersWithPriceUseCase', () => {
  let repository: InMemoryTickerRepository;
  let useCase: GetTickersWithPriceUseCase;

  beforeEach(() => {
    repository = new InMemoryTickerRepository();
    useCase = new GetTickersWithPriceUseCase(repository);
    repository.removeAll();
  });

  it('should return tickers with their last price', async () => {
    // Given
    const ticker1 = new Ticker({
      id: 'ticker-1',
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
      history: [
        new DailyBar({
          id: 'bar-1',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-01'),
          open: 470,
          high: 472,
          low: 468,
          close: 471,
          volume: 1000,
        }),
        new DailyBar({
          id: 'bar-2',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-02'),
          open: 471,
          high: 475,
          low: 470,
          close: 474,
          volume: 1200,
        }),
      ],
    });

    const ticker2 = new Ticker({
      id: 'ticker-2',
      name: 'Euro Stoxx 50',
      symbol: 'SX5E',
      type: TickerType.ETF,
      currency: Currency.EUR,
      history: [
        new DailyBar({
          id: 'bar-3',
          tickerId: 'ticker-2',
          timestamp: new Date('2024-01-01'),
          open: 4100,
          high: 4120,
          low: 4080,
          close: 4110,
          volume: 500,
        }),
      ],
    });

    const ticker3 = new Ticker({
      id: 'ticker-3',
      name: 'Empty History',
      symbol: 'EMPTY',
      type: TickerType.ETF,
      currency: Currency.USD,
      history: [],
    });

    repository.create(ticker1);
    repository.create(ticker2);
    repository.create(ticker3);

    // When
    const result = await useCase.execute();

    // Then
    expect(result).toHaveLength(2);
    const spy = result.find((r) => r.symbol === 'SPY');
    const sx5e = result.find((r) => r.symbol === 'SX5E');

    expect(spy).toBeDefined();
    expect(spy?.price).toBe(474);
    expect(spy?.variation).toBe(3);
    expect(spy?.variationPercent).toBe(0.64);
    expect(spy?.variationDirection).toBe(VariationDirection.UP);

    expect(sx5e).toBeDefined();
    expect(sx5e?.price).toBe(4110);
    expect(sx5e?.variation).toBe(0);
    expect(sx5e?.variationPercent).toBe(0);
    expect(sx5e?.variationDirection).toBe(VariationDirection.FLAT);

    expect(result.find((r) => r.symbol === 'EMPTY')).toBeUndefined();
  });

  it('should compute DOWN and FLAT variations properly', async () => {
    // Given: DOWN case
    const downTicker = new Ticker({
      id: 'down-1',
      name: 'Down Ticker',
      symbol: 'DOWN',
      type: TickerType.ETF,
      currency: Currency.USD,
      history: [
        new DailyBar({
          id: 'bar-1',
          tickerId: 'down-1',
          timestamp: new Date('2024-01-01'),
          open: 100,
          high: 101,
          low: 99,
          close: 100,
          volume: 100,
        }),
        new DailyBar({
          id: 'bar-2',
          tickerId: 'down-1',
          timestamp: new Date('2024-01-02'),
          open: 99.5,
          high: 100,
          low: 95,
          close: 95,
          volume: 120,
        }),
      ],
    });

    // Given: FLAT case (2 barres, même close)
    const flatTicker = new Ticker({
      id: 'flat-1',
      name: 'Flat Ticker',
      symbol: 'FLAT',
      type: TickerType.ETF,
      currency: Currency.EUR,
      history: [
        new DailyBar({
          id: 'bar-3',
          tickerId: 'flat-1',
          timestamp: new Date('2024-01-01'),
          open: 50,
          high: 52,
          low: 49,
          close: 50,
          volume: 200,
        }),
        new DailyBar({
          id: 'bar-4',
          tickerId: 'flat-1',
          timestamp: new Date('2024-01-02'),
          open: 50,
          high: 51,
          low: 49.5,
          close: 50,
          volume: 210,
        }),
      ],
    });

    repository.create(downTicker);
    repository.create(flatTicker);

    // When
    const result = await useCase.execute();

    // Then
    const down = result.find((r) => r.symbol === 'DOWN');
    const flat = result.find((r) => r.symbol === 'FLAT');

    expect(down).toBeDefined();
    expect(down?.price).toBe(95);
    expect(down?.variation).toBe(-5);
    expect(down?.variationPercent).toBe(-5);
    expect(down?.variationDirection).toBe(VariationDirection.DOWN);

    expect(flat).toBeDefined();
    expect(flat?.price).toBe(50);
    expect(flat?.variation).toBe(0);
    expect(flat?.variationPercent).toBe(0);
    expect(flat?.variationDirection).toBe(VariationDirection.FLAT);
  });
});
