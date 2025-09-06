import { DomainError } from '../../base/domain-error';

export class PortfolioTickerNotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
