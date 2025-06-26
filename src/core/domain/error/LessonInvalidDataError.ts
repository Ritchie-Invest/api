import { DomainError } from '../../base/domain-error';

export class LessonInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
