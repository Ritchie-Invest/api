import { CreateChapterCommand } from '../../../core/usecases/create-chapter.use-case';
import { CreateChapterRequest } from '../request/create-chapter.request';
import { Chapter } from '../../../core/domain/model/Chapter';
import { CreateChapterResponse } from '../response/create-chapter.response';
import { ProfileRequest } from '../request/profile.request';

export class CreateChapterMapper {
  static toDomain(
    currentUser: ProfileRequest,
    request: CreateChapterRequest,
  ): CreateChapterCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      title: request.title,
      description: request.description,
    };
  }

  static fromDomain(chapter: Chapter): CreateChapterResponse {
    return new CreateChapterResponse(
      chapter.id,
      chapter.title,
      chapter.description,
      chapter.isPublished,
      chapter.updatedAt,
      chapter.createdAt,
    );
  }
}
