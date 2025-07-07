import { Lesson } from '../../../core/domain/model/Lesson';
import { ProfileRequest } from '../request/profile.request';
import { GetLessonsByChapterIdCommand } from '../../../core/usecases/get-lessons-by-chapter.use-case';
import { GetLessonsByChapterIdResponse } from '../response/get-lessons-by-chapter.response';

export class GetLessonsByChapterIdMapper {
  static toDomain(
    currentUser: ProfileRequest,
    chapterId: string,
  ): GetLessonsByChapterIdCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      chapterId,
    };
  }

  static fromDomain(lessons: Lesson[]): GetLessonsByChapterIdResponse {
    return new GetLessonsByChapterIdResponse(
      lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order !== undefined ? lesson.order : 0,
        isPublished: lesson.isPublished,
        gameType: lesson.gameType,
        modules: lesson.modules,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        chapterId: lesson.chapterId,
      })),
    );
  }
}
