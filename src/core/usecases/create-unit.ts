import { UnitRepository } from '../domain/repository/unit.repository';
import { Unit } from '../domain/model/Unit';
import { UseCase } from '../base/use-case';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';

export type CreateUnitCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  title: string;
  description: string;
  chapterId: string;
};

export class CreateUnitUseCase implements UseCase<CreateUnitCommand, Unit> {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(command: CreateUnitCommand): Promise<Unit> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can create units',
      );
    }
    const { title, description, chapterId } = command;
    const unit = new Unit(this.generateId(), title, description, chapterId);

    return this.unitRepository.create(unit);
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
