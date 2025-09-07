import { DomainError } from '../../base/domain-error';

export class TickerNotFoundError extends DomainError {
  constructor(symbol: string) {
    super(`Ticker not found: ${symbol}`);
  }
}
