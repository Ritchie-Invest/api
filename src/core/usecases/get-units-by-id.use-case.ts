import { UseCase } from '../base/use-case';
import { Unit } from '../domain/model/Unit';
import { UnitRepository } from '../domain/repository/unit.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { UnitNotFoundError } from '../domain/error/UnitNotFoundError';

export type GetUnitByIdCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  unitId: string;
};

export class GetUnitByIdUseCase implements UseCase<GetUnitByIdCommand, Unit> {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(command: GetUnitByIdCommand): Promise<Unit> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError('Unauthorized: Only admins can get units');
    }

    const unit = await this.unitRepository.findById(command.unitId);
    if (!unit) {
      throw new UnitNotFoundError(command.unitId);
    }
    return unit;
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
