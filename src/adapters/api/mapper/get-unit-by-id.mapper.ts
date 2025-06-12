import { Unit } from '../../../core/domain/model/Unit';
import { ProfileRequest } from '../request/profile.request';
import { GetUnitByIdCommand } from '../../../core/usecases/get-units-by-id.use-case';
import { GetUnitByIdResponse } from '../response/get-unit-by-id.response';

export class GetUnitByIdMapper {
  static toDomain(
    currentUser: ProfileRequest,
    unitId: string,
  ): GetUnitByIdCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      unitId: unitId,
    };
  }

  static fromDomain(unit: Unit): GetUnitByIdResponse {
    return new GetUnitByIdResponse(
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
