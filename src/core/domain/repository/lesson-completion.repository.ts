import { LessonCompletion } from '../model/LessonCompletion';

export interface LessonCompletionRepository {
  findByUserIdAndLessonId(
    userId: string,
    lessonId: string,
  ): Promise<LessonCompletion | null> | LessonCompletion | null;

  create(lessonCompletion: LessonCompletion): Promise<void> | void;

  removeAll(): Promise<void> | void;
}
