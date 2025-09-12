import { ProfileRequest } from '../request/profile.request';
import {
  GetUserProgressCommand,
  GetUserProgressResult,
} from '../../../core/usecases/get-user-progress-use-case.service';
import {
  GetUserProgressResponse,
  ChapterSummaryResponse,
  LessonSummaryResponse,
} from '../response/get-user-progress.response';

export class GetUserProgressMapper {
  static toDomain(currentUser: ProfileRequest): GetUserProgressCommand {
    return {
      userId: currentUser.id,
    };
  }

  static fromDomain(result: GetUserProgressResult): GetUserProgressResponse {
    const chapters = result.map(
      (chapter) =>
        new ChapterSummaryResponse(
          chapter.id,
          chapter.title,
          chapter.description,
          chapter.order,
          chapter.status,
          chapter.completedLessons,
          chapter.totalLessons,
          chapter.lessons.map(
            (lesson) =>
              new LessonSummaryResponse(
                lesson.id,
                lesson.title,
                lesson.description,
                lesson.order ?? 0,
                lesson.status,
                lesson.gameModuleId,
              ),
          ),
        ),
    );

    return new GetUserProgressResponse(chapters);
  }
}
