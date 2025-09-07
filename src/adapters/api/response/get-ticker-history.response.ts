import { ApiProperty } from '@nestjs/swagger';

export class DailyBarResponse {
  @ApiProperty({
    description: 'ID of the daily bar',
    example: 'bar-1',
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the ticker',
    example: 'ticker-1',
  })
  tickerId!: string;

  @ApiProperty({
    description: 'Date of the daily bar',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp!: Date;

  @ApiProperty({
    description: 'Opening price',
    example: 100.5,
  })
  open!: number;

  @ApiProperty({
    description: 'Highest price of the day',
    example: 105.2,
  })
  high!: number;

  @ApiProperty({
    description: 'Lowest price of the day',
    example: 99.8,
  })
  low!: number;

  @ApiProperty({
    description: 'Closing price',
    example: 104.1,
  })
  close!: number;

  @ApiProperty({
    description: 'Trading volume',
    example: 1000000,
  })
  volume!: number;
}

export class GetTickerHistoryResponse {
  @ApiProperty({
    description: 'Historical daily bars for the ticker',
    type: [DailyBarResponse],
  })
  history!: DailyBarResponse[];
}
