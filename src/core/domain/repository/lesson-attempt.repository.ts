import { LessonAttempt } from '../model/LessonAttempt';

export interface LessonAttemptRepository {
  create(attempt: LessonAttempt): Promise<void> | void;

  findLastByUserIdAndLessonId(
    userId: string,
    lessonId: string,
  ): Promise<LessonAttempt | null> | LessonAttempt | null;

  finishAttempt(id: string, finishedAt: Date): Promise<void> | void;

  removeAll(): Promise<void> | void;
}
