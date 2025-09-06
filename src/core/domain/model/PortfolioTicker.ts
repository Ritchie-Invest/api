import { DomainModel } from '../../base/domain-model';

export class PortfolioTicker extends DomainModel {
  portfolioId: string;
  tickerId: string;
  value: number;
  shares: number;
  date: Date;

  constructor(params: {
    id: string;
    portfolioId: string;
    tickerId: string;
    value: number;
    shares: number;
    date: Date;
  }) {
    super(params.id);
    this.portfolioId = params.portfolioId;
    this.tickerId = params.tickerId;
    this.value = params.value;
    this.shares = params.shares;
    this.date = params.date;
  }
}