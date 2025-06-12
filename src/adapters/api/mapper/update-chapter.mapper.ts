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
      isPublished: request.isPublished,
    };
  }

  static fromDomain(chapter: Chapter): UpdateChapterResponse {
    return new UpdateChapterResponse(
      chapter.id,
      chapter.title,
      chapter.description,
      chapter.isPublished,
      chapter.updatedAt,
      chapter.createdAt,
    );
  }
}
