import { ApiProperty } from '@nestjs/swagger';

export class PortfolioPositionResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cash: number;

  @ApiProperty()
  investments: number;

  @ApiProperty()
  date: Date;

  constructor(id: string, cash: number, investments: number, date: Date) {
    this.id = id;
    this.cash = cash;
    this.investments = investments;
    this.date = date;
  }
}

export class GetPortfolioPositionsResponse {
  @ApiProperty({ type: [PortfolioPositionResponse] })
  positions: PortfolioPositionResponse[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  variation: number;

  @ApiProperty()
  variationPercent: number;

  @ApiProperty()
  variationDirection: string;

  constructor(
    positions: PortfolioPositionResponse[],
    total: number,
    variation: number,
    variationPercent: number,
    variationDirection: string,
  ) {
    this.positions = positions;
    this.total = total;
    this.variation = variation;
    this.variationPercent = variationPercent;
    this.variationDirection = variationDirection;
  }
}
