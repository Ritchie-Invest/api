import { Unit } from '../../../core/domain/model/Unit';
import { ProfileRequest } from '../request/profile.request';
import { UpdateUnitRequest } from '../request/update-unit.request';
import { UpdateUnitResponse } from '../response/update-unit.response';
import { UpdateUnitCommand } from '../../../core/usecases/update-unit.use-case';

export class UpdateUnitMapper {
  static toDomain(
    currentUser: ProfileRequest,
    unitId: string,
    request: UpdateUnitRequest,
  ): UpdateUnitCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      unitId: unitId,
      title: request.title,
      description: request.description,
      isPublished: request.isPublished,
    };
  }

  static fromDomain(unit: Unit): UpdateUnitResponse {
    return {
      id: unit.id,
      chapterId: unit.chapterId,
      title: unit.title,
      description: unit.description,
      isPublished: unit.isPublished,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }
}
