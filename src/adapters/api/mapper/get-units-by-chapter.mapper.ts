import { Unit } from '../../../core/domain/model/Unit';
import { ProfileRequest } from '../request/profile.request';
import { getUnitsByChapterIdCommand } from '../../../core/usecases/get-units-by-chapter.use-case';
import { GetUnitsByChapterIdResponse } from '../response/get-units-by-chapter.response';

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
      units.map((unit) => ({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        isPublished: unit.isPublished,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
        chapterId: unit.chapterId,
      })),
    );
  }
}
