import { CreateUserUseCase, CreateUserCommand } from '../create-user.use-case';
import { UserRepository } from '../../domain/repository/user.repository';
import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { RefreshTokenRepository } from '../../domain/repository/refresh-token.repository';
import { InMemoryRefreshTokenRepository } from '../../../adapters/in-memory/in-memory-refresh-token.repository';
import { TokenService } from '../../domain/service/token.service';
import { JwtServiceAdapter } from '../../../adapters/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';

describe('CreateUserUseCase', () => {
  let userRepository: UserRepository;
  let refreshTokenRepository: RefreshTokenRepository;
  let tokenService: TokenService;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    tokenService = new JwtServiceAdapter(new JwtService());
    createUserUseCase = new CreateUserUseCase(
      userRepository,
      refreshTokenRepository,
      tokenService,
    );
  });

  it('should be defined', () => {
    expect(createUserUseCase).toBeDefined();
  });

  it('should return access and refresh tokens', async () => {
    // Given
    const command: CreateUserCommand = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    // When
    const result = await createUserUseCase.execute(command);

    // Then
    const users = await userRepository.findAll();
    expect(users.length).toEqual(1);

    const createdUser = users[0];
    expect(createdUser).toBeDefined();
    expect(createdUser?.email).toBe('john.doe@example.com');
    expect(createdUser?.type).toBe('STUDENT');
    expect(createdUser?.password).not.toEqual(command.password);

    expect(result).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      accessToken: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      refreshToken: expect.any(String),
    });
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();

    const refreshTokens = await refreshTokenRepository.findAll();
    expect(refreshTokens.length).toBe(1);
    const refreshToken = refreshTokens[0];
    expect(refreshToken).toBeDefined();
    expect(refreshToken?.token).toBe(result.refreshToken);
    expect(refreshToken?.userId).toBe(createdUser?.id);
  });

  it('should throw UserAlreadyExistsError if user already exists', async () => {
    // Given
    const command: CreateUserCommand = {
      email: 'john.doe@example.com',
      password: 'password123',
    };
    await createUserUseCase.execute(command);
    const command2: CreateUserCommand = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    // When & Then
    await expect(createUserUseCase.execute(command2)).rejects.toThrow(
      'User already exists',
    );
  });

  it('should throw WrongEmailFormatError if email format is invalid', async () => {
    // Given
    const command: CreateUserCommand = {
      email: 'invalid-email',
      password: 'password123',
    };

    // When & Then
    await expect(createUserUseCase.execute(command)).rejects.toThrow(
      'Email invalid-email is not in a valid format',
    );
  });

  it('should throw WrongPasswordFormatError if password is too short', async () => {
    // Given
    const command: CreateUserCommand = {
      email: 'john.doe@example.com',
      password: 'short',
    };

    // When & Then
    await expect(createUserUseCase.execute(command)).rejects.toThrow(
      'Password must be at least 8 characters long',
    );
  });
});
