import { CreateUserUseCase, CreateUserCommand } from '../create-user.use-case';
import { UserRepository } from '../../domain/repository/user.repository';
import { UserPortfolioRepository } from '../../domain/repository/user-portfolio.repository';
import { PortfolioPositionRepository } from '../../domain/repository/portfolio-position.repository';
import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { InMemoryUserPortfolioRepository } from '../../../adapters/in-memory/in-memory-user-portfolio.repository';
import { InMemoryPortfolioPositionRepository } from '../../../adapters/in-memory/in-memory-portfolio-position.repository';
import { Currency } from '../../domain/type/Currency';

describe('CreateUserUseCase', () => {
  let userRepository: UserRepository;
  let userPortfolioRepository: UserPortfolioRepository;
  let PortfolioPositionRepository: PortfolioPositionRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userPortfolioRepository = new InMemoryUserPortfolioRepository();
    PortfolioPositionRepository = new InMemoryPortfolioPositionRepository();
    createUserUseCase = new CreateUserUseCase(
      userRepository,
      userPortfolioRepository,
      PortfolioPositionRepository,
    );
  });

  it('should be defined', () => {
    expect(createUserUseCase).toBeDefined();
  });

  it('should return created user', async () => {
    // Given
    const command: CreateUserCommand = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    // When
    const user = await createUserUseCase.execute(command);

    // Then
    const users = await userRepository.findAll();
    expect(users.length).toEqual(1);
    expect(user).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      email: 'john.doe@example.com',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: expect.any(String),
      type: 'STUDENT',
      totalXp: 0,
      isInvestmentUnlocked: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(Date),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(Date),
    });
    expect(user.password).not.toEqual(command.password);
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

  it('should create a portfolio for the user with USD currency', async () => {
    // Given
    const command: CreateUserCommand = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    // When
    const user = await createUserUseCase.execute(command);

    // Then
    const portfolios = await userPortfolioRepository.findAll();
    expect(portfolios).toHaveLength(1);

    const portfolio = portfolios[0];
    expect(portfolio).toBeDefined();
    expect(portfolio!.userId).toEqual(user.id);
    expect(portfolio!.currency).toEqual(Currency.USD);
  });

  it('should create initial portfolio value with $10,000 cash and $0 investments', async () => {
    // Given
    const command: CreateUserCommand = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    // When
    await createUserUseCase.execute(command);

    // Then
    const portfolios = await userPortfolioRepository.findAll();
    const portfolio = portfolios[0];
    expect(portfolio).toBeDefined();

    const PortfolioPositions = await PortfolioPositionRepository.findAll();
    expect(PortfolioPositions).toHaveLength(1);

    const PortfolioPosition = PortfolioPositions[0];
    expect(PortfolioPosition).toBeDefined();
    expect(PortfolioPosition!.portfolioId).toEqual(portfolio!.id);
    expect(PortfolioPosition!.cash).toEqual(10000);
    expect(PortfolioPosition!.investments).toEqual(0);
    expect(PortfolioPosition!.date).toBeInstanceOf(Date);
  });

  it('should create user, portfolio, and portfolio value in sequence', async () => {
    // Given
    const command: CreateUserCommand = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    // When
    const user = await createUserUseCase.execute(command);

    // Then
    // Verify user exists
    const users = await userRepository.findAll();
    expect(users).toHaveLength(1);
    expect(users[0]).toBeDefined();
    expect(users[0]!.id).toEqual(user.id);

    // Verify portfolio exists and is linked to user
    const portfolios = await userPortfolioRepository.findAll();
    expect(portfolios).toHaveLength(1);
    expect(portfolios[0]).toBeDefined();
    expect(portfolios[0]!.userId).toEqual(user.id);

    // Verify portfolio value exists and is linked to portfolio
    const PortfolioPositions = await PortfolioPositionRepository.findAll();
    expect(PortfolioPositions).toHaveLength(1);
    expect(PortfolioPositions[0]).toBeDefined();
    expect(portfolios[0]).toBeDefined();
    expect(PortfolioPositions[0]!.portfolioId).toEqual(portfolios[0]!.id);
    expect(PortfolioPositions[0]!.cash).toEqual(10000);
  });
});
