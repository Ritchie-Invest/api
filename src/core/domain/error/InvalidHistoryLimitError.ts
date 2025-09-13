import { DomainError } from '../../base/domain-error';

export class InvalidHistoryLimitError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
