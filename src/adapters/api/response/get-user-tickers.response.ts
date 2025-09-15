import { ApiProperty } from '@nestjs/swagger';

export class UserTickerDto {
  @ApiProperty({
    description: 'Ticker ID',
    example: 'ticker-1',
  })
  id!: string;

  @ApiProperty({
    description: 'Ticker name',
    example: 'S&P 500 ETF',
  })
  name!: string;

  @ApiProperty({
    description: 'Ticker symbol',
    example: 'SPY',
  })
  symbol!: string;

  @ApiProperty({
    description: 'Number of shares owned',
    example: 10,
  })
  shares!: number;

  @ApiProperty({
    description: 'Total amount invested in the currency',
    example: 1000.5,
  })
  amount!: number;
}

export class GetUserTickersResponse {
  @ApiProperty({
    description: 'List of ETFs owned by the user',
    type: [UserTickerDto],
  })
  tickers!: UserTickerDto[];
}
