import { Lesson } from '../../../core/domain/model/Lesson';
import { ProfileRequest } from '../request/profile.request';
import { GetLessonByIdCommand } from '../../../core/usecases/get-lesson-by-id.use-case';
import { GetLessonByIdResponse } from '../response/get-lesson-by-id.response';

export class GetLessonByIdMapper {
  static toDomain(
    currentUser: ProfileRequest,
    lessonId: string,
  ): GetLessonByIdCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      lessonId: lessonId,
    };
  }

  static fromDomain(lesson: Lesson): GetLessonByIdResponse {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order !== undefined ? lesson.order : 0,
      chapterId: lesson.chapterId,
      isPublished: lesson.isPublished,
      modules: lesson.modules,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}
