import { UseCase } from '../base/use-case';
import { Unit } from '../domain/model/Unit';
import { UnitRepository } from '../domain/repository/unit.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { UnitNotFoundError } from '../domain/error/UnitNotFoundError';

export type UpdateUnitCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  unitId: string;
  title?: string;
  description: string;
  is_published?: boolean;
};

export class UpdateUnitUseCase implements UseCase<UpdateUnitCommand, Unit> {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(command: UpdateUnitCommand): Promise<Unit> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can update units',
      );
    }

    const { unitId, title, description } = command;

    const currentUnit = await this.unitRepository.findById(unitId);
    if (!currentUnit) {
      throw new UnitNotFoundError(unitId);
    }

    const unit = new Unit(
      currentUnit.id,
      title ?? currentUnit.title,
      description ?? currentUnit.description,
      String(command.is_published ?? currentUnit.is_published),
    );

    const updatedUnit = await this.unitRepository.update(unitId, unit);
    if (!updatedUnit) {
      throw new UnitNotFoundError(unitId);
    }
    return updatedUnit;
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
