import { Chapter } from '../../../core/domain/model/Chapter';
import { ProfileRequest } from '../request/profile.request';
import { GetChapterByIdCommand } from '../../../core/usecases/get-chapter-by-id.use-case';
import { GetChapterByIdResponse } from '../response/get-chapter-by-id.response';

export class GetChapterByIdMapper {
  static toDomain(
    currentUser: ProfileRequest,
    chapterId: string,
  ): GetChapterByIdCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      chapterId: chapterId,
    };
  }

  static fromDomain(chapter: Chapter): GetChapterByIdResponse {
    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      is_published: chapter.isPublished,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    };
  }
}
