import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { UserRepository } from '../../domain/repository/user.repository';
import {
  GetUserProfileUseCase,
  GetUserProfileCommand,
} from '../get-user-profile.use-case';
import { UserFactory } from '../../../adapters/api/controller/__test__/utils/user.factory';
import { Email } from '../../domain/value-object/Email';
import { InMemoryLifeRepository } from '../../../adapters/in-memory/in-memory-life.repository';
import { LifeService } from '../services/life.service';

describe('GetUserProfileUseCase', () => {
  let userRepository: UserRepository;
  let lifeRepository: InMemoryLifeRepository;
  let useCase: GetUserProfileUseCase;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    lifeRepository = new InMemoryLifeRepository();

    const lifeService = new LifeService(lifeRepository);

    useCase = new GetUserProfileUseCase(userRepository, lifeService);

    lifeRepository.removeAll();
    await userRepository.removeAll();
  });

  it('should return user profile with id, email, type, xp, level and life data', async () => {
    // Given
    const existing = UserFactory.make({
      id: 'user-1',
      email: new Email('user@example.com'),
      totalXp: 42,
    });
    await userRepository.create(existing);

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
      life: 5,
      nextLifeIn: 0,
      hasLost: false,
    });
  });

  it('should return has_lost=true when user has no lives left', async () => {
    // Given
    const existing = UserFactory.make({
      id: 'user-2',
      email: new Email('user2@example.com'),
      totalXp: 10,
    });
    await userRepository.create(existing);

    for (let i = 0; i < 5; i++) {
      await lifeRepository.loseLife('user-2');
    }

    const command: GetUserProfileCommand = { userId: existing.id };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result.life).toBe(0);
    expect(result.nextLifeIn).toBeLessThanOrEqual(3600001);
    expect(result.nextLifeIn).toBeGreaterThanOrEqual(3599999);
    expect(result.hasLost).toBe(true);
  });

  it('should return next life in 10 seconds', async () => {
    // Given
    const existing = UserFactory.make({
      id: 'user-2',
      email: new Email('user2@example.com'),
      totalXp: 10,
    });
    await userRepository.create(existing);

    lifeRepository.create({
      userId: 'user-2',
      lostAt: new Date(Date.now() - 60 * 60 * 1000 + 10000),
    });

    const command: GetUserProfileCommand = { userId: existing.id };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result.life).toBe(4);
    expect(result.nextLifeIn).toBeLessThanOrEqual(10001);
    expect(result.nextLifeIn).toBeGreaterThanOrEqual(9999);
    expect(result.hasLost).toBe(false);
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
