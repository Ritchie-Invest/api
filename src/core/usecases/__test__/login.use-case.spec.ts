import { LoginCommand, LoginUseCase } from '../login.use-case';
import { UserRepository } from '../../domain/repository/user.repository';
import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import bcrypt from 'bcryptjs';
import { TokenService } from '../../domain/service/token.service';
import { User } from '../../domain/model/User';

describe('LoginUseCase', () => {
  let userRepository: UserRepository;
  let loginUseCase: LoginUseCase;
  let tokenService: TokenService;

  const DEFAULT_EMAIL = 'john.doe@example.com';
  const DEFAULT_PASSWORD = 'password123';

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    tokenService = {
      generateToken: jest.fn().mockReturnValue('mocked-jwt-token'),
      verifyToken: jest.fn(),
    };
    loginUseCase = new LoginUseCase(userRepository, tokenService);
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
    return userRepository.create({ email, password: hashedPassword });
  };

  it('should be defined', () => {
    expect(loginUseCase).toBeDefined();
  });

  it('should return user and token when credentials are valid', async () => {
    // Given
    const command = makeLoginCommand();
    const user = await createUserInRepo(command.email, command.password);

    // When
    const result = await loginUseCase.execute(command);

    // Then
    expect(result).toEqual('mocked-jwt-token');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(tokenService.generateToken).toHaveBeenCalledWith({
      id: user.id,
      email: user.email,
      type: user.type,
    });
  });

  it('should throw an error when user is not found', async () => {
    const command = makeLoginCommand();

    await expect(loginUseCase.execute(command)).rejects.toThrow(
      'User with email john.doe@example.com not found',
    );
  });

  it('should throw an error when password is invalid', async () => {
    const command = makeLoginCommand();
    await createUserInRepo(command.email, 'wrongpassword');

    await expect(loginUseCase.execute(command)).rejects.toThrow(
      'User with email john.doe@example.com not found',
    );
  });
});
