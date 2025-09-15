import { DomainError } from '../../base/domain-error';

export class EmptyTickerHistoryError extends DomainError {
  constructor(tickerId: string) {
    super(`Ticker history for ticker with id ${tickerId} is empty.`);
  }
}
