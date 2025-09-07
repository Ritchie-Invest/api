import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from '../portfolio.controller';
import { GetPortfolioUseCase } from '../../../../core/usecases/get-portfolio.use-case';
import { GetPortfolioPositionsUseCase } from '../../../../core/usecases/get-portfolio-positions.use-case';
import { User } from '../../../../core/domain/model/User';
import { PortfolioPosition } from '../../../../core/domain/model/PortfolioPosition';
import { Currency } from '../../../../core/domain/type/Currency';
import { UserType } from '../../../../core/domain/type/UserType';
import { InvalidUserError } from '../../../../core/domain/error/InvalidUserError';
import { PortfolioNotFoundError } from '../../../../core/domain/error/PortfolioNotFoundError';

describe('PortfolioController', () => {
  let controller: PortfolioController;
  let getPortfolioUseCase: jest.Mocked<GetPortfolioUseCase>;
  let getPortfolioPositionsUseCase: jest.Mocked<GetPortfolioPositionsUseCase>;

  const mockUser = new User(
    'user-1',
    'test@example.com',
    'hashedpassword',
    UserType.STUDENT,
  );

  beforeEach(async () => {
    const mockGetPortfolioUseCase = {
      execute: jest.fn(),
    };

    const mockGetPortfolioPositionsUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        {
          provide: GetPortfolioUseCase,
          useValue: mockGetPortfolioUseCase,
        },
        {
          provide: GetPortfolioPositionsUseCase,
          useValue: mockGetPortfolioPositionsUseCase,
        },
      ],
    }).compile();

    controller = module.get<PortfolioController>(PortfolioController);
    getPortfolioUseCase = module.get<GetPortfolioUseCase>(
      GetPortfolioUseCase,
    ) as jest.Mocked<GetPortfolioUseCase>;
    getPortfolioPositionsUseCase = module.get<GetPortfolioPositionsUseCase>(
      GetPortfolioPositionsUseCase,
    ) as jest.Mocked<GetPortfolioPositionsUseCase>;
  });

  describe('getPortfolio', () => {
    it('should return portfolio data successfully', async () => {
      // when
      const expectedResult = {
        currency: Currency.USD,
        cash: 1000,
        investments: 2000,
        totalValue: 3000,
      };
      getPortfolioUseCase.execute.mockResolvedValue(expectedResult);
      // then
      const result = await controller.getPortfolio(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(getPortfolioUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
      expect(result).toEqual(
        expect.objectContaining({
          currency: Currency.USD,
          cash: 1000,
          investments: 2000,
          totalValue: 3000,
        }),
      );
    });

    it('should throw InvalidUserError when portfolio not found', async () => {
      // when
      const error: Error = new InvalidUserError(
        'Portfolio not found for this user',
      );
      getPortfolioUseCase.execute.mockRejectedValue(error);
      // then
      await expect(controller.getPortfolio(mockUser)).rejects.toThrow(
        'Portfolio not found for this user',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(getPortfolioUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should return portfolio with EUR currency', async () => {
      // when
      const expectedResult = {
        currency: Currency.EUR,
        cash: 1500,
        investments: 2500,
        totalValue: 4000,
      };
      getPortfolioUseCase.execute.mockResolvedValue(expectedResult);
      // then
      const result = await controller.getPortfolio(mockUser);
      expect(result.currency).toBe(Currency.EUR);
      expect(result.cash).toBe(1500);
      expect(result.investments).toBe(2500);
      expect(result.totalValue).toBe(4000);
    });

    it('should return portfolio with zero values when no portfolio values exist', async () => {
      // when
      const expectedResult = {
        currency: Currency.GBP,
        cash: 0,
        investments: 0,
        totalValue: 0,
      };
      getPortfolioUseCase.execute.mockResolvedValue(expectedResult);
      // then
      const result = await controller.getPortfolio(mockUser);
      expect(result.currency).toBe(Currency.GBP);
      expect(result.cash).toBe(0);
      expect(result.investments).toBe(0);
      expect(result.totalValue).toBe(0);
    });

    it('should throw error if use case throws a generic error', async () => {
      // when
      const error: Error = new Error('Unexpected error');
      getPortfolioUseCase.execute.mockRejectedValue(error);
      // then
      await expect(controller.getPortfolio(mockUser)).rejects.toThrow(
        'Unexpected error',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(getPortfolioUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should call use case with correct user id', async () => {
      // when
      const expectedResult = {
        currency: Currency.USD,
        cash: 500,
        investments: 1000,
        totalValue: 1500,
      };
      getPortfolioUseCase.execute.mockResolvedValue(expectedResult);
      // then
      await controller.getPortfolio(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(getPortfolioUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should handle portfolio with negative cash and investments', async () => {
      // when
      const expectedResult = {
        currency: Currency.EUR,
        cash: -100,
        investments: -200,
        totalValue: -300,
      };
      getPortfolioUseCase.execute.mockResolvedValue(expectedResult);
      // then
      const result = await controller.getPortfolio(mockUser);
      expect(result.currency).toBe(Currency.EUR);
      expect(result.cash).toBe(-100);
      expect(result.investments).toBe(-200);
      expect(result.totalValue).toBe(-300);
    });

    it('should handle portfolio with large values', async () => {
      // when
      const expectedResult = {
        currency: Currency.USD,
        cash: 1_000_000,
        investments: 2_000_000,
        totalValue: 3_000_000,
      };
      getPortfolioUseCase.execute.mockResolvedValue(expectedResult);
      // then
      const result = await controller.getPortfolio(mockUser);
      expect(result.currency).toBe(Currency.USD);
      expect(result.cash).toBe(1_000_000);
      expect(result.investments).toBe(2_000_000);
      expect(result.totalValue).toBe(3_000_000);
    });

    it('should throw if user is undefined', async () => {
      // when
      // then
      // @ts-expect-error: testing undefined user
      await expect(controller.getPortfolio(undefined)).rejects.toThrow();
    });
  });

  describe('getPortfolioPositions', () => {
    const mockPositions = [
      new PortfolioPosition({
        id: 'position-1',
        portfolioId: 'portfolio-1',
        cash: 1000,
        investments: 2000,
        date: new Date('2024-01-01'),
      }),
      new PortfolioPosition({
        id: 'position-2',
        portfolioId: 'portfolio-1',
        cash: 1500,
        investments: 2500,
        date: new Date('2024-01-02'),
      }),
    ];

    it('should return portfolio positions successfully', async () => {
      // when
      const expectedResult = {
        positions: mockPositions,
        total: 2,
      };
      getPortfolioPositionsUseCase.execute.mockResolvedValue(expectedResult);

      // then
      const result = await controller.getPortfolioPositions(mockUser);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(getPortfolioPositionsUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
        limit: undefined,
        offset: undefined,
      });

      expect(result.positions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.positions[0]).toEqual(
        expect.objectContaining({
          id: 'position-1',
          portfolioId: 'portfolio-1',
          cash: 1000,
          investments: 2000,
          date: new Date('2024-01-01'),
        }),
      );
    });

    it('should return portfolio positions with limit and offset', async () => {
      // when
      const expectedResult = {
        positions: [mockPositions[0]],
        total: 2,
      };
      getPortfolioPositionsUseCase.execute.mockResolvedValue(expectedResult);

      // then
      const result = await controller.getPortfolioPositions(mockUser, 1, 0);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(getPortfolioPositionsUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
        limit: 1,
        offset: 0,
      });

      expect(result.positions).toHaveLength(1);
      expect(result.total).toBe(2);
    });

    it('should return empty positions when no positions exist', async () => {
      // when
      const expectedResult = {
        positions: [],
        total: 0,
      };
      getPortfolioPositionsUseCase.execute.mockResolvedValue(expectedResult);

      // then
      const result = await controller.getPortfolioPositions(mockUser);

      expect(result.positions).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw PortfolioNotFoundError when portfolio not found', async () => {
      // when
      const error = new PortfolioNotFoundError(
        'Portfolio not found for this user',
      );
      getPortfolioPositionsUseCase.execute.mockRejectedValue(error);

      // then
      await expect(controller.getPortfolioPositions(mockUser)).rejects.toThrow(
        'Portfolio not found for this user',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(getPortfolioPositionsUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
        limit: undefined,
        offset: undefined,
      });
    });

    it('should throw InvalidUserError when userId is invalid', async () => {
      // when
      const error = new InvalidUserError('User ID is required');
      getPortfolioPositionsUseCase.execute.mockRejectedValue(error);

      // then
      await expect(controller.getPortfolioPositions(mockUser)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('should handle large datasets with pagination', async () => {
      // when
      const largeDataset: PortfolioPosition[] = [];
      for (let index = 0; index < 50; index++) {
        largeDataset.push(
          new PortfolioPosition({
            id: `position-${index + 1}`,
            portfolioId: 'portfolio-1',
            cash: 1000 + index * 100,
            investments: 2000 + index * 200,
            date: new Date(`2024-01-${String(index + 1).padStart(2, '0')}`),
          }),
        );
      }

      const expectedResult = {
        positions: largeDataset.slice(0, 10),
        total: 50,
      };
      getPortfolioPositionsUseCase.execute.mockResolvedValue(expectedResult);

      // then
      const result = await controller.getPortfolioPositions(mockUser, 10, 0);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(getPortfolioPositionsUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
        limit: 10,
        offset: 0,
      });

      expect(result.positions).toHaveLength(10);
      expect(result.total).toBe(50);
    });
  });
});
