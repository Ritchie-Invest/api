import {
  CompleteLessonCommand,
  CompleteLessonResult,
} from '../../../core/usecases/complete-lesson.use-case';
import { CompleteLessonResponse } from '../response/complete-lesson.response';

export class CompleteLessonMapper {
  static toDomain(userId: string, lessonId: string): CompleteLessonCommand {
    return {
      userId,
      lessonId,
    };
  }

  static fromDomain(result: CompleteLessonResult): CompleteLessonResponse {
    return new CompleteLessonResponse(result.score, result.totalGameModules);
  }
}
