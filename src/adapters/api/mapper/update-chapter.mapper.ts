import { Chapter } from '../../../core/domain/model/Chapter';
import { ProfileRequest } from '../request/profile.request';
import { UpdateChapterRequest } from '../request/update-chapter.request';
import { UpdateChapterResponse } from '../response/update-chapter.response';
import { UpdateChapterCommand } from '../../../core/usecases/update-chapter.use-case';

export class UpdateChapterMapper {
  static toDomain(
    currentUser: ProfileRequest,
    chapterId: string,
    request: UpdateChapterRequest,
  ): UpdateChapterCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      chapterId: chapterId,
      title: request.title,
      description: request.description,
      is_published: request.is_published,
    };
  }

  static fromDomain(chapter: Chapter): UpdateChapterResponse {
    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      is_published: chapter.is_published,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    };
  }
}
