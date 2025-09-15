import { DomainError } from '../../base/domain-error';

export class LessonAlreadyCompletedError extends DomainError {
  constructor(lessonId: string) {
    super(`Lesson with id ${lessonId} has already been completed.`);
  }
}
