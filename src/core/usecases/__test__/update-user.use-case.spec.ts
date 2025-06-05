import {
  UpdateUserTypeUseCase,
  UpdateUserTypeCommand,
} from '../update-user-type.use-case';
import { UserRepository } from '../../domain/repository/user.repository';
import { InMemoryUserRepository } from '../../../adapters/in-memory/in-memory-user.repository';
import { UserType } from '../../domain/type/UserType';

describe('UpdateUserTypeUseCase', () => {
  let userRepository: UserRepository;
  let updateUserTypeUseCase: UpdateUserTypeUseCase;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    await userRepository.create({
      id: 'user-1',
      type: UserType.STUDENT,
    });
    updateUserTypeUseCase = new UpdateUserTypeUseCase(userRepository);
  });

  it('should return updated user if current user is a superadmin', async () => {
    // Given
    await userRepository.create({
      id: 'superadmin-1',
      type: UserType.SUPERADMIN,
    });
    const command: UpdateUserTypeCommand = {
      currentUser: {
        id: 'superadmin-1',
        type: UserType.SUPERADMIN,
      },
      userId: 'user-1',
      type: UserType.ADMIN,
    };

    // When
    const user = await updateUserTypeUseCase.execute(command);

    // Then
    expect(user).toMatchObject({
      id: 'user-1',
      type: UserType.ADMIN,
    });
  });

  it('should throw UserNotAllowedError if current user is a simple user', async () => {
    // Given
    const command: UpdateUserTypeCommand = {
      currentUser: {
        id: 'user-1',
        type: UserType.STUDENT,
      },
      userId: 'user-1',
      type: UserType.ADMIN,
    };

    // When & Then
    await expect(updateUserTypeUseCase.execute(command)).rejects.toThrow(
      'You are not allowed to update this user',
    );
  });

  it('should throw UserNotAllowedError if current user is an admin', async () => {
    // Given
    const command: UpdateUserTypeCommand = {
      currentUser: {
        id: 'user-1',
        type: UserType.ADMIN,
      },
      userId: 'user-1',
      type: UserType.ADMIN,
    };

    // When & Then
    await expect(updateUserTypeUseCase.execute(command)).rejects.toThrow(
      'You are not allowed to update this user',
    );
  });
});
