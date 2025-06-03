import { CreateUserUseCase, CreateUserCommand } from '../create-user.use-case';
import { UserRepository } from '../../domain/repository/user.repository';
import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';

describe('CreateUserUseCase', () => {
  let userRepository: UserRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
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
});
