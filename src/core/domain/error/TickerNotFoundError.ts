import { DomainError } from '../../base/domain-error';

export class TickerNotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}