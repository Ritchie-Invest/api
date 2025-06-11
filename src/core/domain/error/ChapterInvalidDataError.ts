import { DomainError } from '../../base/domain-error';

export class ChapterInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
