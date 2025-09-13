import { Lesson } from '../../../core/domain/model/Lesson';
import { ProfileRequest } from '../request/profile.request';
import { UpdateLessonRequest } from '../request/update-lesson.request';
import { UpdateLessonResponse } from '../response/update-lesson.response';
import { UpdateLessonCommand } from '../../../core/usecases/update-lesson.use-case';

export class UpdateLessonMapper {
  static toDomain(
    currentUser: ProfileRequest,
    lessonId: string,
    request: UpdateLessonRequest,
  ): UpdateLessonCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      lessonId: lessonId,
      title: request.title,
      description: request.description,
      isPublished: request.isPublished,
    };
  }

  static fromDomain(lesson: Lesson): UpdateLessonResponse {
    return {
      id: lesson.id,
      chapterId: lesson.chapterId,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order ?? 0,
      isPublished: lesson.isPublished,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}
