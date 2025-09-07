import { GetTickerHistoryUseCase } from '../get-ticker-history.use-case';
import { DailyBarRepository } from '../../domain/repository/daily-bar.repository';
import { DailyBar } from '../../domain/model/DailyBar';
import { InvalidHistoryLimitError } from '../../domain/error/InvalidHistoryLimitError';

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
      });
    });
  });
});
