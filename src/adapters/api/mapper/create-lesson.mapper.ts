import { CreateLessonCommand } from '../../../core/usecases/create-lesson.use-case';
import { CreateLessonRequest } from '../request/create-lesson.request';
import { Lesson } from '../../../core/domain/model/Lesson';
import { CreateLessonResponse } from '../response/create-lesson.response';
import { ProfileRequest } from '../request/profile.request';

export class CreateLessonMapper {
  static toDomain(
    currentUser: ProfileRequest,
    request: CreateLessonRequest,
  ): CreateLessonCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      title: request.title,
      description: request.description,
      chapterId: request.chapterId,
    };
  }

  static fromDomain(lesson: Lesson): CreateLessonResponse {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      chapterId: lesson.chapterId,
      order: lesson.order !== undefined ? lesson.order : 0,
      isPublished: lesson.isPublished,
      modules: lesson.modules,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}
