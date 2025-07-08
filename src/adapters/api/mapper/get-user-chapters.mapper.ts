import { ProfileRequest } from '../request/profile.request';
import {
  GetUserChaptersCommand,
  GetUserChaptersResult,
} from '../../../core/usecases/get-user-chapters.usecase';
import {
  GetUserChaptersResponse,
  ChapterSummaryResponse,
  LessonSummaryResponse,
} from '../response/get-user-chapters.response';

export class GetUserChaptersMapper {
  static toDomain(currentUser: ProfileRequest): GetUserChaptersCommand {
    return {
      userId: currentUser.id,
    };
  }

  static fromDomain(result: GetUserChaptersResult): GetUserChaptersResponse {
    const chapters = result.chapters.map(
      (chapter) =>
        new ChapterSummaryResponse(
          chapter.id,
          chapter.title,
          chapter.description,
          chapter.order,
          chapter.is_unlocked,
          chapter.completed_lessons,
          chapter.total_lessons,
          chapter.lessons.map(
            (lesson) =>
              new LessonSummaryResponse(
                lesson.id,
                lesson.title,
                lesson.description,
                lesson.order,
                lesson.is_unlocked,
                lesson.completed_modules,
                lesson.total_modules,
              ),
          ),
        ),
    );

    return new GetUserChaptersResponse(chapters);
  }
}
