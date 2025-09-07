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

  constructor(positions: PortfolioPositionResponse[], total: number) {
    this.positions = positions;
    this.total = total;
  }
}
