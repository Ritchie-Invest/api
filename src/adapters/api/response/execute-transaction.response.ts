import { ApiProperty } from '@nestjs/swagger';

export class ExecuteTransactionResponse {
  @ApiProperty()
  cash: number;

  @ApiProperty()
  investments: number;

  @ApiProperty()
  tickerHoldings: number;

  constructor(cash: number, investments: number, tickerHoldings: number) {
    this.cash = cash;
    this.investments = investments;
    this.tickerHoldings = tickerHoldings;
  }
}