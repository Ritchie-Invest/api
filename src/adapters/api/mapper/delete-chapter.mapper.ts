import { ProfileRequest } from '../request/profile.request';
import { DeleteChapterResponse } from '../response/delete-chapter.response';
import { DeleteChapterCommand } from '../../../core/usecases/delete-chapter.use-case';

export class DeleteChapterMapper {
  static toDomain(
    currentUser: ProfileRequest,
    chapterId: string,
  ): DeleteChapterCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      chapterId: chapterId,
    };
  }

  static fromDomain(
    chapterId: string,
    deletedLessonsCount: number = 0,
  ): DeleteChapterResponse {
    return new DeleteChapterResponse(chapterId, deletedLessonsCount);
  }
}
