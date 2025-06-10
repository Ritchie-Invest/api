import { LogoutUseCase, LogoutCommand } from '../logout.use-case';
import { UserRepository } from '../../domain/repository/user.repository';
import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { RefreshTokenRepository } from '../../domain/repository/refresh-token.repository';

describe('LogoutUseCase', () => {
  let userRepository: UserRepository;
  let refreshTokenRepository: RefreshTokenRepository;
  let logoutUseCase: LogoutUseCase;

  const DEFAULT_EMAIL = 'john.doe@example.com';

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = {
      expireNow: jest.fn().mockResolvedValue(undefined),
    } as unknown as RefreshTokenRepository;

    logoutUseCase = new LogoutUseCase(userRepository, refreshTokenRepository);
  });

  it('should logout and expire refresh token', async () => {
    // Given
    const user = await userRepository.create({
      email: DEFAULT_EMAIL,
      password: 'anyhash',
    });

    const command: LogoutCommand = {
      currentUser: { email: user.email },
      refreshToken: 'some-refresh-token',
    };

    // When
    const result = await logoutUseCase.execute(command);

    // Then
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(refreshTokenRepository.expireNow as jest.Mock).toHaveBeenCalledWith(
      'some-refresh-token',
    );
    expect(result).toBeUndefined();
  });

  it('should throw when user is not found', async () => {
    const command: LogoutCommand = {
      currentUser: { email: 'missing@example.com' },
      refreshToken: 'irrelevant-token',
    };

    await expect(logoutUseCase.execute(command)).rejects.toThrow(
      'User with email missing@example.com not found',
    );
  });
});
