import { DomainError } from '../../base/domain-error';

export class PortfolioValueNotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}