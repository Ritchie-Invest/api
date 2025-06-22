import { Chapter } from '../../../core/domain/model/Chapter';
import { ProfileRequest } from '../request/profile.request';
import { GetChaptersCommand } from '../../../core/usecases/get-chapters.use-case';
import { GetChaptersResponse } from '../response/get-chapters.response';
import { GetChapterByIdResponse } from '../response/get-chapter-by-id.response';

export class GetChaptersMapper {
  static toDomain(currentUser: ProfileRequest): GetChaptersCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
    };
  }

  static fromDomain(chapters: Chapter[]): GetChaptersResponse {
    return new GetChaptersResponse(
      chapters.map(
        (chapter) =>
          new GetChapterByIdResponse(
            chapter.id,
            chapter.title,
            chapter.description,
            chapter.isPublished,
            chapter.updatedAt,
            chapter.createdAt,
          ),
      ),
    );
  }
}
