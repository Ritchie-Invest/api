import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { UserRepository } from '../../domain/repository/user.repository';
import {
  CreateSuperadminUseCase,
  CreateSuperadminCommand,
} from '../create-superadmin.use-case';
import { UserType } from '../../domain/type/UserType';

describe('CreateSuperadminUseCase', () => {
  let userRepository: UserRepository;
  let useCase: CreateSuperadminUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new CreateSuperadminUseCase(userRepository);
  });

  it('creates a SUPERADMIN when user does not exist', async () => {
    // Given
    const command: CreateSuperadminCommand = {
      email: 'admin@example.com',
      password: 'password123',
    };

    // When
    const user = await useCase.execute(command);

    // Then
    const users = await userRepository.findAll();
    expect(users.length).toBe(1);
    expect(user).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      email: 'admin@example.com',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: expect.any(String),
      type: UserType.SUPERADMIN,
      xp: 0,
      level: 1,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(Date),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(Date),
    });
    expect(user.password).not.toEqual(command.password);
  });

  it('is idempotent if user already SUPERADMIN (returns existing)', async () => {
    // Given
    const existing = await useCase.execute({
      email: 'admin@example.com',
      password: 'password123',
    });

    // When
    const again = await useCase.execute({
      email: 'admin@example.com',
      password: 'anotherPassword',
    });

    // Then
    expect(again.id).toBe(existing.id);
    expect(again.type).toBe(UserType.SUPERADMIN);
  });

  it('promotes existing non-superadmin user without changing password', async () => {
    // Given
    const created = await userRepository.create({
      id: 'user-1',
      email: 'john.doe@example.com',
      password: 'hashed-password',
      type: UserType.STUDENT,
    });

    // When
    const promoted = await useCase.execute({
      email: 'john.doe@example.com',
      password: 'ignored-here',
    });

    // Then
    expect(promoted.id).toBe(created.id);
    expect(promoted.type).toBe(UserType.SUPERADMIN);
    expect(promoted.password).toBe('hashed-password');
  });

  it('validates email format and password length', async () => {
    await expect(
      useCase.execute({ email: 'bad', password: 'password123' }),
    ).rejects.toThrow('Email bad is not in a valid format');

    await expect(
      useCase.execute({ email: 'admin@example.com', password: 'short' }),
    ).rejects.toThrow('Password must be at least 8 characters long');
  });
});
