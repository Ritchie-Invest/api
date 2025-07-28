import { DomainError } from '../../base/domain-error';

export class ModuleAlreadyAttemptedError extends DomainError {
  constructor(moduleId: string, lessonAttemptId: string) {
    super(
      `Module with id ${moduleId} has already been attempted in lesson attempt ${lessonAttemptId}`,
    );
  }
}
