import { Unit } from '../../../core/domain/model/Unit';
import { ProfileRequest } from '../request/profile.request';
import { getUnitsByChapterIdCommand } from '../../../core/usecases/get-units-by-chapter.use-case';
import { GetUnitsByChapterIdResponse } from '../response/get-units-by-chapter.response';
import { GetUnitByIdResponse } from '../response/get-unit-by-id.response';

export class getUnitsByChapterIdMapper {
  static toDomain(
    currentUser: ProfileRequest,
    chapterId: string,
  ): getUnitsByChapterIdCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      chapterId,
    };
  }

  static fromDomain(units: Unit[]): GetUnitsByChapterIdResponse {
    return new GetUnitsByChapterIdResponse(
      units.map(
        (unit) =>
          new GetUnitByIdResponse(
            unit.id,
            unit.title,
            unit.description,
            unit.chapterId,
            unit.isPublished,
            unit.updatedAt,
            unit.createdAt,
          ),
      ),
    );
  }
}
