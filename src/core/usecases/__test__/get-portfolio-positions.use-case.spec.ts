import { GetPortfolioPositionsUseCase } from '../get-portfolio-positions.use-case';
import { InMemoryUserPortfolioRepository } from '../../../adapters/in-memory/in-memory-user-portfolio.repository';
import { InMemoryPortfolioPositionRepository } from '../../../adapters/in-memory/in-memory-portfolio-position.repository';
import { UserPortfolio } from '../../domain/model/UserPortfolio';
import { PortfolioPosition } from '../../domain/model/PortfolioPosition';
import { Currency } from '../../domain/type/Currency';
import { GetPortfolioPositionsCommand } from '../get-portfolio-positions.use-case';

describe('GetPortfolioPositionsUseCase', () => {
  let getPortfolioPositionsUseCase: GetPortfolioPositionsUseCase;
  let userPortfolioRepository: InMemoryUserPortfolioRepository;
  let portfolioPositionRepository: InMemoryPortfolioPositionRepository;

  const DEFAULT_USER_ID = 'user-1';
  const DEFAULT_PORTFOLIO_ID = 'portfolio-1';

  beforeEach(() => {
    userPortfolioRepository = new InMemoryUserPortfolioRepository();
    portfolioPositionRepository = new InMemoryPortfolioPositionRepository();

    getPortfolioPositionsUseCase = new GetPortfolioPositionsUseCase(
      userPortfolioRepository,
      portfolioPositionRepository,
    );

    userPortfolioRepository.removeAll();
    portfolioPositionRepository.removeAll();
  });

  describe('execute', () => {
    it('should throw InvalidUserError when userId is empty', async () => {
      // Given
      const command: GetPortfolioPositionsCommand = { userId: '' };

      // When / Then
      await expect(
        getPortfolioPositionsUseCase.execute(command),
      ).rejects.toThrow('User ID is required');
    });

    it('should throw PortfolioNotFoundError when portfolio not found', async () => {
      // Given
      const command: GetPortfolioPositionsCommand = { userId: DEFAULT_USER_ID };

      // When / Then
      await expect(
        getPortfolioPositionsUseCase.execute(command),
      ).rejects.toThrow('Portfolio not found for this user');
    });

    it('should return empty positions when no positions exist', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.USD,
      });
      userPortfolioRepository.create(userPortfolio);

      const command: GetPortfolioPositionsCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioPositionsUseCase.execute(command);

      // Then
      expect(result).toEqual({
        positions: [],
        total: 0,
      });
    });

    it('should return all positions sorted by date descending', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.USD,
      });
      userPortfolioRepository.create(userPortfolio);

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const position1 = new PortfolioPosition({
        id: 'position-1',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 1000,
        investments: 2000,
        date: today,
      });

      const position2 = new PortfolioPosition({
        id: 'position-2',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 900,
        investments: 1900,
        date: yesterday,
      });

      const position3 = new PortfolioPosition({
        id: 'position-3',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 800,
        investments: 1800,
        date: twoDaysAgo,
      });

      portfolioPositionRepository.create(position1);
      portfolioPositionRepository.create(position2);
      portfolioPositionRepository.create(position3);

      const command: GetPortfolioPositionsCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioPositionsUseCase.execute(command);

      // Then
      expect(result.total).toBe(3);
      expect(result.positions).toHaveLength(3);
      expect(result.positions[0]?.id).toBe('position-1'); // Most recent first
      expect(result.positions[1]?.id).toBe('position-2');
      expect(result.positions[2]?.id).toBe('position-3');
    });

    it('should handle pagination with limit', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.EUR,
      });
      userPortfolioRepository.create(userPortfolio);

      // Create 5 positions
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const position = new PortfolioPosition({
          id: `position-${i}`,
          portfolioId: DEFAULT_PORTFOLIO_ID,
          cash: 1000 + i * 100,
          investments: 2000 + i * 100,
          date,
        });
        portfolioPositionRepository.create(position);
      }

      const command: GetPortfolioPositionsCommand = {
        userId: DEFAULT_USER_ID,
        limit: 2,
      };

      // When
      const result = await getPortfolioPositionsUseCase.execute(command);

      // Then
      expect(result.total).toBe(5);
      expect(result.positions).toHaveLength(2);
      expect(result.positions[0]?.id).toBe('position-0');
      expect(result.positions[1]?.id).toBe('position-1');
    });

    it('should only return positions for the correct portfolio', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.USD,
      });
      userPortfolioRepository.create(userPortfolio);

      const correctPosition = new PortfolioPosition({
        id: 'correct-position',
        portfolioId: DEFAULT_PORTFOLIO_ID,
        cash: 1000,
        investments: 2000,
        date: new Date(),
      });

      const wrongPosition = new PortfolioPosition({
        id: 'wrong-position',
        portfolioId: 'other-portfolio',
        cash: 5000,
        investments: 6000,
        date: new Date(),
      });

      portfolioPositionRepository.create(correctPosition);
      portfolioPositionRepository.create(wrongPosition);

      const command: GetPortfolioPositionsCommand = { userId: DEFAULT_USER_ID };

      // When
      const result = await getPortfolioPositionsUseCase.execute(command);

      // Then
      expect(result.total).toBe(1);
      expect(result.positions).toHaveLength(1);
      expect(result.positions[0]?.id).toBe('correct-position');
    });

    it('should handle limit', async () => {
      // Given
      const userPortfolio = new UserPortfolio({
        id: DEFAULT_PORTFOLIO_ID,
        userId: DEFAULT_USER_ID,
        currency: Currency.GBP,
      });
      userPortfolioRepository.create(userPortfolio);

      // Create 3 positions
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const position = new PortfolioPosition({
          id: `position-${i}`,
          portfolioId: DEFAULT_PORTFOLIO_ID,
          cash: 1000,
          investments: 2000,
          date,
        });
        portfolioPositionRepository.create(position);
      }

      const command: GetPortfolioPositionsCommand = {
        userId: DEFAULT_USER_ID,
        limit: 2,
      };

      // When
      const result = await getPortfolioPositionsUseCase.execute(command);

      // Then
      expect(result.total).toBe(3);
      expect(result.positions).toHaveLength(2);
      expect(result.positions[0]?.id).toBe('position-0'); // Most recent
      expect(result.positions[1]?.id).toBe('position-1');
    });
  });
});
