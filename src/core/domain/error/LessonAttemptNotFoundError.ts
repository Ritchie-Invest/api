import { DomainError } from '../../base/domain-error';

export class LessonAttemptNotFoundError extends DomainError {
  constructor(userId: string, lessonId: string) {
    super(`Lesson attempt not found for user ${userId} and lesson ${lessonId}`);
  }
}
