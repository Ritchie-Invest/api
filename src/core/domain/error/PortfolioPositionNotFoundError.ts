import { DomainError } from '../../base/domain-error';

export class PortfolioPositionNotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
