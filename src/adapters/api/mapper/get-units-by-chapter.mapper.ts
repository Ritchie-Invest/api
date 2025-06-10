import { Unit } from '../../../core/domain/model/Unit';
import { ProfileRequest } from '../request/profile.request';
import { GetUnitsByChapterCommand } from '../../../core/usecases/get-units-by-chapter.use-case';
import { GetUnitsByChapterResponse } from '../response/get-units-by-chapter.response';

export class GetUnitsByChapterMapper {
  static toDomain(currentUser: ProfileRequest, chapterId: string): GetUnitsByChapterCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      chapterId,
    };
  }

  static fromDomain(units: Unit[]): GetUnitsByChapterResponse {
    return new GetUnitsByChapterResponse(
      units.map((unit) => ({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        is_published: unit.is_published,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
        chapterId: unit.chapterId,
      }))
    );
  }
}