import { DomainError } from '../../base/domain-error';

export class LessonNotFullyAttemptedError extends DomainError {
  constructor(
    lessonId: string,
    attemptedModules: number,
    totalModules: number,
  ) {
    super(
      `All modules in lesson ${lessonId} have not been fully attempted. Attempted: ${attemptedModules}, Total: ${totalModules}`,
    );
  }
}
