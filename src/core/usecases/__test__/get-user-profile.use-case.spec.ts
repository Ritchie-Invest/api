import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { UserRepository } from '../../domain/repository/user.repository';
import {
  GetUserProfileUseCase,
  GetUserProfileCommand,
} from '../get-user-profile.use-case';
import { UserFactory } from '../../../adapters/api/controller/__test__/utils/user.factory';

describe('GetUserProfileUseCase', () => {
  let userRepository: UserRepository;
  let useCase: GetUserProfileUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new GetUserProfileUseCase(userRepository);
  });

  it('should return user profile with id, email, type, xp, and level', async () => {
    // Given
    const existing = UserFactory.make({
      id: 'user-1',
      email: 'user@example.com',
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
    });
  });

  it('should throw UserNotFoundError when user does not exist', async () => {
    // Given
    const command: GetUserProfileCommand = { userId: 'missing-id' };

    // When & Then
    await expect(useCase.execute(command)).rejects.toThrow(
      'User with email missing-id not found',
    );
  });
});
