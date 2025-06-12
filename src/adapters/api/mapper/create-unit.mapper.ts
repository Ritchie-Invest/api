import { CreateUnitCommand } from '../../../core/usecases/create-unit';
import { CreateUnitRequest } from '../request/create-unit.request';
import { Unit } from '../../../core/domain/model/Unit';
import { CreateUnitResponse } from '../response/create-unit.response';
import { ProfileRequest } from '../request/profile.request';

export class CreateUnitMapper {
  static toDomain(
    currentUser: ProfileRequest,
    request: CreateUnitRequest,
  ): CreateUnitCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      title: request.title,
      description: request.description,
      chapterId: request.chapterId,
    };
  }

  static fromDomain(unit: Unit): CreateUnitResponse {
    return new CreateUnitResponse(
      unit.id,
      unit.title,
      unit.description,
      unit.chapterId,
      unit.isPublished,
      unit.updatedAt,
      unit.createdAt,
    );
  }
}
