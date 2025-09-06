import { DomainModel } from '../../base/domain-model';
import { TransactionType } from '../type/TransactionType';

export class Transaction extends DomainModel {
  portfolioId: string;
  tickerId: string;
  type: TransactionType;
  amount: number;
  volume: number;
  currentTickerPrice: number;

  constructor(params: {
    id: string;
    portfolioId: string;
    tickerId: string;
    type: TransactionType;
    amount: number;
    volume: number;
    currentTickerPrice: number;
  }) {
    super(params.id);
    this.portfolioId = params.portfolioId;
    this.tickerId = params.tickerId;
    this.type = params.type;
    this.amount = params.amount;
    this.volume = params.volume;
    this.currentTickerPrice = params.currentTickerPrice;
  }
}
