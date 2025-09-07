import { DomainModel } from '../../base/domain-model';

export class DailyBar extends DomainModel {
  tickerId: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;

  constructor(params: {
    id: string;
    tickerId: string;
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }) {
    super(params.id);
    this.tickerId = params.tickerId;
    this.timestamp = params.timestamp;
    this.open = params.open;
    this.high = params.high;
    this.low = params.low;
    this.close = params.close;
    this.volume = params.volume;
  }
}
