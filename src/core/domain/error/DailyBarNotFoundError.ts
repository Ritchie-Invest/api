import { DomainError } from '../../base/domain-error';

export class DailyBarNotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}