import { DomainModel } from '../../base/domain-model';
import { TransactionType } from '../type/TransactionType';

export class Transaction extends DomainModel {
  portfolioId: string;
  tickerId: string;
  type: TransactionType;
  value: number;

  constructor(params: {
    id: string;
    portfolioId: string;
    tickerId: string;
    type: TransactionType;
    value: number;
  }) {
    super(params.id);
    this.portfolioId = params.portfolioId;
    this.tickerId = params.tickerId;
    this.type = params.type;
    this.value = params.value;
  }
}
