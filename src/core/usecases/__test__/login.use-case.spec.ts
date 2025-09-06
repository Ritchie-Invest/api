import { LoginCommand, LoginUseCase } from '../login.use-case';
import { UserRepository } from '../../domain/repository/user.repository';
import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { TokenService } from '../../domain/service/token.service';
import { User } from '../../domain/model/User';
import { RefreshTokenRepository } from '../../domain/repository/refresh-token.repository';
import { UserPortfolioRepository } from '../../domain/repository/user-portfolio.repository';
import { InMemoryUserPortfolioRepository } from '../../../adapters/in-memory/in-memory-user-portfolio.repository';
import bcrypt from 'bcryptjs';
import { InMemoryRefreshTokenRepository } from '../../../adapters/in-memory/in-memory-refresh-token.repository';
import { Currency } from '../../domain/type/Currency';
import { UserType } from '../../domain/type/UserType';

describe('LoginUseCase', () => {
  let userRepository: UserRepository;
  let loginUseCase: LoginUseCase;
  let tokenService: TokenService;
  let refreshTokenRepositoryMock: RefreshTokenRepository;
  let userPortfolioRepository: UserPortfolioRepository;

  const DEFAULT_EMAIL = 'john.doe@example.com';
  const DEFAULT_PASSWORD = 'password123';

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userPortfolioRepository = new InMemoryUserPortfolioRepository();
    tokenService = {
      generateAccessToken: jest.fn().mockReturnValue('mocked-access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('mocked-refresh-token'),
    } as unknown as TokenService;

    refreshTokenRepositoryMock = new InMemoryRefreshTokenRepository();

    loginUseCase = new LoginUseCase(
      userRepository,
      refreshTokenRepositoryMock,
      userPortfolioRepository,
      tokenService,
    );
  });

  const makeLoginCommand = (
    email = DEFAULT_EMAIL,
    password = DEFAULT_PASSWORD,
  ): LoginCommand => ({
    email,
    password,
  });

  const createUserInRepo = async (
    email: string,
    rawPassword: string,
  ): Promise<User> => {
    const hashedPassword: string = await bcrypt.hash(rawPassword, 10);
    const user = new User(
      'user-1',
      email, 
      hashedPassword,
      UserType.STUDENT,
    );
    const createdUser = await userRepository.create(user);
    
    await userPortfolioRepository.create({
      id: `portfolio-${createdUser.id}`,
      userId: createdUser.id,
      currency: Currency.USD,
    });
    
    return createdUser;
  };

  it('should be defined', () => {
    expect(loginUseCase).toBeDefined();
  });

  it('should return access and refresh tokens When credentials are valid', async () => {
    // Given
    const command = makeLoginCommand();
    const user = await createUserInRepo(command.email, command.password);

    // When
    const result = await loginUseCase.execute(command);

    // Then
    expect(result).toEqual({
      accessToken: 'mocked-access-token',
      refreshToken: 'mocked-refresh-token',
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(tokenService.generateAccessToken as jest.Mock).toHaveBeenCalledWith({
      id: user.id,
      email: user.email,
      type: user.type,
      portfolioId: expect.any(String),
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(tokenService.generateRefreshToken as jest.Mock).toHaveBeenCalledWith(
      {
        id: user.id,
        email: user.email,
        type: user.type,
        portfolioId: expect.any(String),
      },
    );
  });

  it('should throw an error When user is not found', async () => {
    const command = makeLoginCommand();

    await expect(loginUseCase.execute(command)).rejects.toThrow(
      'User with email john.doe@example.com not found',
    );
  });

  it('should throw an error When password is invalid', async () => {
    const command = makeLoginCommand();
    await createUserInRepo(command.email, 'wrongpassword');

    await expect(loginUseCase.execute(command)).rejects.toThrow(
      'User with email john.doe@example.com not found',
    );
  });
});
