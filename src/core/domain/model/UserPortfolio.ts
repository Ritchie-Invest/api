import { DomainModel } from '../../base/domain-model';
import { Currency } from '../type/Currency';

export class UserPortfolio extends DomainModel {
  userId: string;
  currency: Currency;

  constructor(params: {
    id: string;
    userId: string;
    currency: Currency;
  }) {
    super(params.id);
    this.userId = params.userId;
    this.currency = params.currency;
  }
}