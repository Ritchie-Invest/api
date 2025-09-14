import { GetTickerHistoryUseCase } from '../get-ticker-history.use-case';
import { DailyBarRepository } from '../../domain/repository/daily-bar.repository';
import { DailyBar } from '../../domain/model/DailyBar';
import { InvalidHistoryLimitError } from '../../domain/error/InvalidHistoryLimitError';
import { VariationDirection } from '../../domain/type/VariationDirection';

/* eslint-disable @typescript-eslint/unbound-method */

describe('GetTickerHistoryUseCase', () => {
  let useCase: GetTickerHistoryUseCase;
  let dailyBarRepository: jest.Mocked<DailyBarRepository>;

  beforeEach(() => {
    dailyBarRepository = {
      findByTickerIdWithLimit: jest.fn(),
    } as unknown as jest.Mocked<DailyBarRepository>;

    useCase = new GetTickerHistoryUseCase(dailyBarRepository);
  });

  describe('execute', () => {
    const tickerId = 'ticker-1';
    const mockHistory = [
      new DailyBar({
        id: 'bar-1',
        tickerId: 'ticker-1',
        timestamp: new Date('2024-01-03'),
        open: 100,
        high: 105,
        low: 99,
        close: 104,
        volume: 1000,
      }),
      new DailyBar({
        id: 'bar-2',
        tickerId: 'ticker-1',
        timestamp: new Date('2024-01-02'),
        open: 95,
        high: 101,
        low: 94,
        close: 100,
        volume: 1200,
      }),
      new DailyBar({
        id: 'bar-3',
        tickerId: 'ticker-1',
        timestamp: new Date('2024-01-01'),
        open: 90,
        high: 96,
        low: 89,
        close: 95,
        volume: 1500,
      }),
    ];

    it('should return ticker history with valid parameters', async () => {
      // Given
      const limit = 3;
      dailyBarRepository.findByTickerIdWithLimit.mockResolvedValue(mockHistory);

      // When
      const result = await useCase.execute({ tickerId, limit });

      // Then
      expect(dailyBarRepository.findByTickerIdWithLimit).toHaveBeenCalledWith(
        tickerId,
        limit,
      );
      expect(result).toEqual({
        history: mockHistory,
        variation: 9,
        variationPercent: 9.47,
        variationDirection: VariationDirection.UP,
      });
    });

    it('should return empty history when no data found', async () => {
      // Given
      const limit = 30;
      dailyBarRepository.findByTickerIdWithLimit.mockResolvedValue([]);

      // When
      const result = await useCase.execute({ tickerId, limit });

      // Then
      expect(dailyBarRepository.findByTickerIdWithLimit).toHaveBeenCalledWith(
        tickerId,
        limit,
      );
      expect(result).toEqual({
        history: [],
        variation: 0,
        variationPercent: 0,
        variationDirection: VariationDirection.FLAT,
      });
    });

    it('should throw error when limit is 0', async () => {
      // Given
      const limit = 0;

      // When & Then
      await expect(useCase.execute({ tickerId, limit })).rejects.toThrow(
        InvalidHistoryLimitError,
      );
    });

    it('should throw error when limit is negative', async () => {
      // Given
      const limit = -5;

      // When & Then
      await expect(useCase.execute({ tickerId, limit })).rejects.toThrow(
        InvalidHistoryLimitError,
      );
    });

    it('should throw error when limit exceeds 365', async () => {
      // Given
      const limit = 366;

      // When & Then
      await expect(useCase.execute({ tickerId, limit })).rejects.toThrow(
        InvalidHistoryLimitError,
      );
    });

    it('should work with maximum allowed limit of 365', async () => {
      // Given
      const limit = 365;
      dailyBarRepository.findByTickerIdWithLimit.mockResolvedValue(mockHistory);

      // When
      const result = await useCase.execute({ tickerId, limit });

      // Then
      expect(dailyBarRepository.findByTickerIdWithLimit).toHaveBeenCalledWith(
        tickerId,
        limit,
      );
      expect(result).toEqual({
        history: mockHistory,
        variation: 9,
        variationPercent: 9.47,
        variationDirection: VariationDirection.UP,
      });
    });

    it('should calculate negative variation correctly', async () => {
      // Given
      const limit = 2;
      const decreasingHistory = [
        new DailyBar({
          id: 'bar-2',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-02'),
          open: 95,
          high: 96,
          low: 90,
          close: 90,
          volume: 1200,
        }),
        new DailyBar({
          id: 'bar-1',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-01'),
          open: 100,
          high: 105,
          low: 99,
          close: 100,
          volume: 1000,
        }),
      ];
      dailyBarRepository.findByTickerIdWithLimit.mockResolvedValue(
        decreasingHistory,
      );

      // When
      const result = await useCase.execute({ tickerId, limit });

      // Then
      expect(result).toEqual({
        history: decreasingHistory,
        variation: -10, // 90 - 100 = -10
        variationPercent: -10, // (-10 / 100) * 100 = -10
        variationDirection: VariationDirection.DOWN,
      });
    });

    it('should handle single data point', async () => {
      // Given
      const limit = 1;
      const singleHistory = [
        new DailyBar({
          id: 'bar-1',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-01'),
          open: 100,
          high: 105,
          low: 99,
          close: 100,
          volume: 1000,
        }),
      ];
      dailyBarRepository.findByTickerIdWithLimit.mockResolvedValue(
        singleHistory,
      );

      // When
      const result = await useCase.execute({ tickerId, limit });

      // Then
      expect(result).toEqual({
        history: singleHistory,
        variation: 0,
        variationPercent: 0,
        variationDirection: VariationDirection.FLAT,
      });
    });

    it('should handle flat variation (no change)', async () => {
      // Given
      const limit = 2;
      const flatHistory = [
        new DailyBar({
          id: 'bar-1',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-01'),
          open: 100,
          high: 105,
          low: 99,
          close: 100,
          volume: 1000,
        }),
        new DailyBar({
          id: 'bar-2',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-02'),
          open: 99,
          high: 101,
          low: 98,
          close: 100,
          volume: 1200,
        }),
      ];
      dailyBarRepository.findByTickerIdWithLimit.mockResolvedValue(flatHistory);

      // When
      const result = await useCase.execute({ tickerId, limit });

      // Then
      expect(result).toEqual({
        history: flatHistory,
        variation: 0, // 100 - 100 = 0
        variationPercent: 0, // (0 / 100) * 100 = 0
        variationDirection: VariationDirection.FLAT,
      });
    });
  });
});
