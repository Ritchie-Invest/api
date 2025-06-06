import { Chapter } from '../../../core/domain/model/Chapter';
import { ProfileRequest } from '../request/profile.request';
import { GetChaptersCommand } from '../../../core/usecases/get-chapters.use-case';
import { GetChaptersResponse } from '../response/get-chapters.response';

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
    return {
      chapters: chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        is_published: chapter.isPublished,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      })),
    };
  }
}
