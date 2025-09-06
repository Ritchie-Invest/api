import { DomainError } from '../../base/domain-error';

export class InsufficientCashError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
