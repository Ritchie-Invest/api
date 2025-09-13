/* eslint-disable @typescript-eslint/unbound-method */
import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { UserRepository } from '../../domain/repository/user.repository';
import {
  GetUserProfileUseCase,
  GetUserProfileCommand,
} from '../get-user-profile.use-case';
import { UserFactory } from '../../../adapters/api/controller/__test__/utils/user.factory';
import { Email } from '../../domain/value-object/Email';
import { LifeRepository } from '../../domain/repository/life.repository';

describe('GetUserProfileUseCase', () => {
  let userRepository: UserRepository;
  let useCase: GetUserProfileUseCase;
  let mockLifeRepository: jest.Mocked<LifeRepository>;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();

    // Mock LifeRepository
    mockLifeRepository = {
      getUserLifeData: jest.fn(),
      addLostLife: jest.fn(),
      getLastLostLife: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn(),
    } as unknown as jest.Mocked<LifeRepository>;

    useCase = new GetUserProfileUseCase(userRepository, mockLifeRepository);
  });

  it('should return user profile with id, email, type, xp, level and life data', async () => {
    // Given
    const existing = UserFactory.make({
      id: 'user-1',
      email: new Email('user@example.com'),
      totalXp: 42,
    });
    await userRepository.create(existing);

    const mockLifeData = {
      life_number: 3,
      next_life_in: 1800, // 30 minutes in seconds
      has_lost: false,
    };
    mockLifeRepository.getUserLifeData.mockResolvedValue(mockLifeData);

    const command: GetUserProfileCommand = { userId: existing.id };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result).toEqual({
      id: existing.id,
      email: existing.email,
      totalXp: 42,
      level: existing.level,
      xpRequiredForNextLevel: existing.xpRequiredForNextLevel,
      xpForThisLevel: existing.xpForThisLevel,
      isInvestmentUnlocked: existing.isInvestmentUnlocked,
      levelRequiredToUnlockInvestment: 5,
      life_number: 3,
      next_life_in: 1800,
      has_lost: false,
    });

    expect(mockLifeRepository.getUserLifeData).toHaveBeenCalledWith(
      existing.id,
    );
  });

  it('should return has_lost=true when user has no lives left', async () => {
    // Given
    const existing = UserFactory.make({
      id: 'user-2',
      email: new Email('user2@example.com'),
      totalXp: 10,
    });
    await userRepository.create(existing);

    const mockLifeData = {
      life_number: 0,
      next_life_in: 2400, // 40 minutes until next life
      has_lost: true,
    };
    mockLifeRepository.getUserLifeData.mockResolvedValue(mockLifeData);

    const command: GetUserProfileCommand = { userId: existing.id };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result.has_lost).toBe(true);
    expect(result.life_number).toBe(0);
    expect(result.next_life_in).toBe(2400);
  });

  it('should throw UserNotFoundError when user does not exist', async () => {
    // Given
    const command: GetUserProfileCommand = { userId: 'missing-id' };

    // When & Then
    await expect(useCase.execute(command)).rejects.toThrow(
      'User with id missing-id not found',
    );
  });
});
