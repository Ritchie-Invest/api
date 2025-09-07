import { GetTickerHistoryMapper } from '../get-ticker-history.mapper';
import { DailyBar } from '../../../../core/domain/model/DailyBar';
import { GetTickerHistoryResult as UseCaseResult } from '../../../../core/usecases/get-ticker-history.use-case';

describe('GetTickerHistoryMapper', () => {
  describe('fromDomain', () => {
    it('should map domain response to API response', () => {
      // Given
      const dailyBars = [
        new DailyBar({
          id: 'bar-1',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-03T00:00:00.000Z'),
          open: 100.5,
          high: 105.2,
          low: 99.8,
          close: 104.1,
          volume: 1000000,
        }),
        new DailyBar({
          id: 'bar-2',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-02T00:00:00.000Z'),
          open: 95.3,
          high: 101.7,
          low: 94.1,
          close: 100.5,
          volume: 1200000,
        }),
      ];

      const useCaseResult: UseCaseResult = {
        history: dailyBars,
      };

      // When
      const result = GetTickerHistoryMapper.fromDomain(useCaseResult);

      // Then
      expect(result).toEqual({
        history: [
          {
            id: 'bar-1',
            tickerId: 'ticker-1',
            timestamp: new Date('2024-01-03T00:00:00.000Z'),
            open: 100.5,
            high: 105.2,
            low: 99.8,
            close: 104.1,
            volume: 1000000,
          },
          {
            id: 'bar-2',
            tickerId: 'ticker-1',
            timestamp: new Date('2024-01-02T00:00:00.000Z'),
            open: 95.3,
            high: 101.7,
            low: 94.1,
            close: 100.5,
            volume: 1200000,
          },
        ],
      });
    });

    it('should handle empty history', () => {
      // Given
      const useCaseResult: UseCaseResult = {
        history: [],
      };

      // When
      const result = GetTickerHistoryMapper.fromDomain(useCaseResult);

      // Then
      expect(result).toEqual({
        history: [],
      });
    });
  });
});
