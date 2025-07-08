import { DomainError } from '../../base/domain-error';

export class OrderConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
