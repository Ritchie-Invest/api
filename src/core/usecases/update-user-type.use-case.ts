import { UseCase } from '../base/use-case';
import { User } from '../domain/model/User';
import { UserRepository } from '../domain/repository/user.repository';
import { UserNotFoundError } from '../domain/error/UserNotFoundError';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { UserType } from '../domain/type/UserType';

export type UpdateUserTypeCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  userId: string;
  type: UserType;
};

export class UpdateUserTypeUseCase
  implements UseCase<UpdateUserTypeCommand, User>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserTypeCommand): Promise<User> {
    const { type, userId, currentUser } = command;

    if (!this.canExecute(currentUser)) {
      throw new UserNotAllowedError('You are not allowed to update this user');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    user.type = type;

    const updatedUser = await this.userRepository.update(user.id, user);
    if (!updatedUser) {
      throw new UserNotFoundError(userId);
    }
    return updatedUser;
  }

  private canExecute(user: Pick<User, 'id' | 'type'>): boolean {
    return user.type === UserType.SUPERADMIN;
  }
}
