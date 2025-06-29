import { ProfileRequest } from '../request/profile.request';
import { DeleteLessonResponse } from '../response/delete-lesson.response';
import { DeleteLessonCommand } from '../../../core/usecases/delete-lesson.use-case';

export class DeleteLessonMapper {
  static toDomain(
    currentUser: ProfileRequest,
    lessonId: string,
  ): DeleteLessonCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      lessonId: lessonId,
    };
  }

  static fromDomain(lessonId: string, deletedGamesCount: number = 0): DeleteLessonResponse {
    return new DeleteLessonResponse(lessonId, deletedGamesCount);
  }
}
