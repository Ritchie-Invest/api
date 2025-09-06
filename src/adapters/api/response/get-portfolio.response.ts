import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../../core/domain/type/Currency';

export class GetPortfolioResponse {
  @ApiProperty({ enum: Currency })
  currency: Currency;

  @ApiProperty()
  cash: number;

  @ApiProperty()
  investments: number;

  @ApiProperty()
  totalValue: number;

  constructor(
    currency: Currency,
    cash: number,
    investments: number,
    totalValue: number,
  ) {
    this.currency = currency;
    this.cash = cash;
    this.investments = investments;
    this.totalValue = totalValue;
  }
}
