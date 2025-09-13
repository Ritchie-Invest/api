import { DomainModel } from '../../base/domain-model';

export class PortfolioPosition extends DomainModel {
  portfolioId: string;
  cash: number;
  investments: number;
  date: Date;

  constructor(params: {
    id: string;
    portfolioId: string;
    cash: number;
    investments: number;
    date: Date;
  }) {
    super(params.id);
    this.portfolioId = params.portfolioId;
    this.cash = params.cash;
    this.investments = params.investments;
    this.date = params.date;
  }
}
