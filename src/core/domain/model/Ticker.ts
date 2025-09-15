import { DomainModel } from '../../base/domain-model';
import { TickerType } from '../type/TickerType';
import { Currency } from '../type/Currency';
import { DailyBar } from './DailyBar';
import { EmptyTickerHistoryError } from '../error/EmptyTickerHistoryError';

export class Ticker extends DomainModel {
  name: string;
  symbol: string;
  type: TickerType;
  currency: Currency;
  history: DailyBar[];

  constructor(params: {
    id: string;
    name: string;
    symbol: string;
    type: TickerType;
    currency: Currency;
    history?: DailyBar[];
  }) {
    super(params.id);
    this.name = params.name;
    this.symbol = params.symbol;
    this.type = params.type;
    this.currency = params.currency;
    this.history = params.history || [];
  }

  get price(): number {
    const lastBar = this.history[this.history.length - 1];
    if (!lastBar) {
      throw new EmptyTickerHistoryError(this.id);
    }
    return lastBar.close ?? 0;
  }
}
