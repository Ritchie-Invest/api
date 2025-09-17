import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { UserRepository } from '../../domain/repository/user.repository';
import {
  CreateSuperadminUseCase,
  CreateSuperadminCommand,
} from '../create-superadmin.use-case';
import { UserType } from '../../domain/type/UserType';
import { Email } from '../../domain/value-object/Email';
import { afterEach } from 'node:test';

describe('CreateSuperadminUseCase', () => {
  let userRepository: UserRepository;
  let useCase: CreateSuperadminUseCase;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    useCase = new CreateSuperadminUseCase(userRepository);

    await userRepository.removeAll();
  });

  afterEach(async () => {
    await userRepository.removeAll();
  });

  it('creates a SUPERADMIN when user does not exist', async () => {
    // Given
    const command: CreateSuperadminCommand = {
      email: new Email('admin@example.com'),
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
      email: new Email('admin@example.com'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: expect.any(String),
      type: UserType.SUPERADMIN,
      totalXp: 0,
      isInvestmentUnlocked: false,
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
      email: new Email('admin@example.com'),
      password: 'password123',
    });

    // When
    const again = await useCase.execute({
      email: new Email('admin@example.com'),
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
      email: new Email('john.doe@example.com'),
      password: 'hashed-password',
      type: UserType.STUDENT,
    });

    // When
    const promoted = await useCase.execute({
      email: new Email('john.doe@example.com'),
      password: 'ignored-here',
    });

    // Then
    expect(promoted.id).toBe(created.id);
    expect(promoted.type).toBe(UserType.SUPERADMIN);
    expect(promoted.password).toBe('hashed-password');
  });

  it('validates password length', async () => {
    const command2: CreateSuperadminCommand = {
      email: new Email('admin@example.com'),
      password: 'short',
    };
    await expect(useCase.execute(command2)).rejects.toThrow(
      'Password must be at least 8 characters long',
    );
  });
});
