import { DomainError } from '../../base/domain-error';

export class InsufficientHoldingsError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}