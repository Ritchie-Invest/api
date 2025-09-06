import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from '../portfolio.controller';
import { GetPortfolioUseCase } from '../../../../core/usecases/get-portfolio.use-case';
import { User } from '../../../../core/domain/model/User';
import { Currency } from '../../../../core/domain/type/Currency';
import { UserType } from '../../../../core/domain/type/UserType';
import { InvalidUserError } from '../../../../core/domain/error/InvalidUserError';

describe('PortfolioController', () => {
  let controller: PortfolioController;
  let getPortfolioUseCase: jest.Mocked<GetPortfolioUseCase>;

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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        {
          provide: GetPortfolioUseCase,
          useValue: mockGetPortfolioUseCase,
        },
      ],
    }).compile();

    controller = module.get<PortfolioController>(PortfolioController);
    getPortfolioUseCase = module.get<GetPortfolioUseCase>(
      GetPortfolioUseCase,
    ) as jest.Mocked<GetPortfolioUseCase>;
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
});
