/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { LifeService } from '../life.service';
import { InMemoryUserRepository } from '../../../../adapters/in-memory/in-memory-user.repository';
import { UserRepository } from '../../../domain/repository/user.repository';

interface MockPrismaLifeDelegate {
  count: jest.Mock<Promise<number>, [any?]>;
  findFirst: jest.Mock<Promise<{ emissionDate: Date } | null>, [any?]>;
  create: jest.Mock<Promise<void>, [any?]>;
}
interface MockPrismaService {
  life: MockPrismaLifeDelegate;
}
// Subset type matching only what LifeService uses
type PrismaSubset = Pick<MockPrismaService, 'life'>;

describe('LifeService', () => {
  let lifeService: LifeService;
  let userRepository: UserRepository;
  let mockPrisma: MockPrismaService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();

    // Mock PrismaService
    mockPrisma = {
      life: {
        count: jest.fn<Promise<number>, [any?]>(),
        findFirst: jest.fn<Promise<{ emissionDate: Date } | null>, [any?]>(),
        create: jest.fn<Promise<void>, [any?]>(),
      },
    };

    // Cast mockPrisma to subset expected (duck-typing) without broad any

    lifeService = new LifeService(
      userRepository,
      mockPrisma as unknown as PrismaSubset as any,
    );
  });

  describe('getUserLifeData', () => {
    it('should return 5 lives when no lives lost', async () => {
      // Given
      const userId = 'user-1';
      mockPrisma.life.count.mockResolvedValue(0);

      // When
      const result = await lifeService.getUserLifeData(userId);

      // Then
      expect(result).toEqual({
        life_number: 5,
        next_life_in: 0,
        has_lost: false,
      });

      // Verify the query was called with correct time window (last 5 hours)
      expect(mockPrisma.life.count).toHaveBeenCalledWith({
        where: {
          userId,
          emissionDate: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it('should return 3 lives when 2 lives lost in last hour', async () => {
      // Given
      const userId = 'user-1';
      mockPrisma.life.count.mockResolvedValue(2);

      // When
      const result = await lifeService.getUserLifeData(userId);

      // Then
      expect(result).toEqual({
        life_number: 3,
        next_life_in: 0,
        has_lost: false,
      });
    });

    it('should return has_lost=true when all 5 lives lost in last hour', async () => {
      // Given
      const userId = 'user-1';
      mockPrisma.life.count.mockResolvedValue(5);

      // When
      const result = await lifeService.getUserLifeData(userId);

      // Then
      expect(result).toEqual({
        life_number: 0,
        next_life_in: 0,
        has_lost: true,
      });
    });

    it('should calculate next_life_in correctly when lives are lost', async () => {
      // Given
      const userId = 'user-1';
      const now = new Date();
      const oldestLifeLost = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

      mockPrisma.life.count.mockResolvedValue(2);
      mockPrisma.life.findFirst.mockResolvedValue({
        emissionDate: oldestLifeLost,
      } as { emissionDate: Date });

      // When
      const result = await lifeService.getUserLifeData(userId);

      // Then
      expect(result.life_number).toBe(3);
      expect(result.next_life_in).toBe(30 * 60); // 30 minutes in seconds
      expect(result.has_lost).toBe(false);
    });

    it('should handle case when oldest life would regenerate in the past', async () => {
      // Given
      const userId = 'user-1';
      const now = new Date();
      const oldestLifeLost = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

      mockPrisma.life.count.mockResolvedValue(1);
      mockPrisma.life.findFirst.mockResolvedValue({
        emissionDate: oldestLifeLost,
      } as { emissionDate: Date });

      // When
      const result = await lifeService.getUserLifeData(userId);

      // Then
      expect(result.life_number).toBe(4);
      expect(result.next_life_in).toBe(0); // Should be 0 as regeneration time has passed
      expect(result.has_lost).toBe(false);
    });

    it('should show 4 lives then 5 lives after 1h passes for a single lost life', async () => {
      const userId = 'user-regen-1';
      const now = new Date();
      const lost30MinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      mockPrisma.life.count.mockResolvedValueOnce(1); // first call -> still within 1h
      mockPrisma.life.findFirst.mockResolvedValueOnce({
        emissionDate: lost30MinAgo,
      } as { emissionDate: Date });
      const first = await lifeService.getUserLifeData(userId);
      expect(first.life_number).toBe(4);
      expect(first.next_life_in).toBeGreaterThan(0);

      // Simuler qu'on rappelle avec un événement plus vieux que 1h -> count = 0
      mockPrisma.life.count.mockResolvedValueOnce(0);
      const second = await lifeService.getUserLifeData(userId);
      expect(second.life_number).toBe(5);
      expect(second.next_life_in).toBe(0);
    });

    it('should handle multiple lost lives with staggered regeneration timings', async () => {
      const userId = 'user-regen-2';
      const now = new Date();
      const lost10MinAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const lost40MinAgo = new Date(now.getTime() - 40 * 60 * 1000);
      // 2 vies perdues dans la dernière heure
      mockPrisma.life.count.mockResolvedValueOnce(2);
      mockPrisma.life.findFirst.mockResolvedValueOnce({
        emissionDate: lost40MinAgo,
      } as { emissionDate: Date });
      const phase1 = await lifeService.getUserLifeData(userId);
      expect(phase1.life_number).toBe(3);
      expect(phase1.next_life_in).toBeGreaterThan(0);

      // Après 25 minutes supplémentaires: la vie perdue à 40min passe >1h (simulate count=1)
      mockPrisma.life.count.mockResolvedValueOnce(1);
      mockPrisma.life.findFirst.mockResolvedValueOnce({
        emissionDate: lost10MinAgo,
      } as { emissionDate: Date });
      const phase2 = await lifeService.getUserLifeData(userId);
      expect(phase2.life_number).toBe(4);
      expect(phase2.next_life_in).toBeGreaterThan(0);

      // Après encore 50 minutes: plus aucune dans la fenêtre (simulate count=0)
      mockPrisma.life.count.mockResolvedValueOnce(0);
      const phase3 = await lifeService.getUserLifeData(userId);
      expect(phase3.life_number).toBe(5);
      expect(phase3.next_life_in).toBe(0);
    });
  });

  describe('addLostLife', () => {
    it('should call userRepository.addLostLife with correct userId', async () => {
      // Given
      const userId = 'user-1';
      const addLostLifeSpy = jest
        .spyOn(userRepository, 'addLostLife')
        .mockResolvedValue();

      // When
      await lifeService.addLostLife(userId);

      // Then
      expect(addLostLifeSpy).toHaveBeenCalledWith(userId);
    });
  });
});
