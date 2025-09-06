import { DomainError } from '../../base/domain-error';

export class PortfolioNotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}