import { DomainError } from '../../base/domain-error';

export class LessonAttemptAlreadyFinishedError extends DomainError {
  constructor(lessonId: string) {
    super(`Lesson attempt with id ${lessonId} has already been finished.`);
  }
}
