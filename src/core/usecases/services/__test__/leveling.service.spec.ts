import { InMemoryUserRepository } from '../../../../adapters/in-memory/in-memory-user.repository';
import { LevelingService } from '../leveling.service';
import { UserType } from '../../../domain/type/UserType';

describe('LevelingService', () => {
  let userRepository: InMemoryUserRepository;
  let leveling: LevelingService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    leveling = new LevelingService(userRepository);
  });

  it('should unlock investment when reaching level 5', async () => {
    // Given
    const user = userRepository.create({
      id: 'u-1',
      email: 'u@example.com',
      password: 'pwd',
      type: UserType.STUDENT,
      totalXp: 89,
      isInvestmentUnlocked: false,
    });

    expect(user.level).toBe(4);

    // When
    await leveling.incrementXp(user.id, 1);

    // Then
    const updated = userRepository.findById(user.id)!;
    expect(updated.level).toBe(5);
    expect(updated.isInvestmentUnlocked).toBe(true);
  });

  it('should do nothing when amount <= 0', async () => {
    // Given
    const user = userRepository.create({
      id: 'u-2',
      email: 'u2@example.com',
      password: 'pwd',
      type: UserType.STUDENT,
      totalXp: 0,
      isInvestmentUnlocked: false,
    });

    // When
    await leveling.incrementXp(user.id, 0);

    // Then
    const same = userRepository.findById(user.id)!;
    expect(same.totalXp).toBe(0);
    expect(same.isInvestmentUnlocked).toBe(false);
  });
});
