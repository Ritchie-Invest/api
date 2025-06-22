import { Lesson } from '../../../core/domain/model/Lesson';
import { ProfileRequest } from '../request/profile.request';
import { getLessonsByChapterIdCommand } from '../../../core/usecases/get-lessons-by-chapter.use-case';
import { getLessonsByChapterIdResponse } from '../response/get-lessons-by-chapter.response';

export class getLessonsByChapterIdMapper {
  static toDomain(
    currentUser: ProfileRequest,
    chapterId: string,
  ): getLessonsByChapterIdCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      chapterId,
    };
  }

  static fromDomain(lessons: Lesson[]): getLessonsByChapterIdResponse {
    return new getLessonsByChapterIdResponse(
      lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order !== undefined ? lesson.order : 0,
        isPublished: lesson.isPublished,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        chapterId: lesson.chapterId,
      })),
    );
  }
}
