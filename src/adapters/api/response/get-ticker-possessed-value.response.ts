import { ApiProperty } from '@nestjs/swagger';

export class GetTickerPossessedValueResponse {
  @ApiProperty({
    description: 'ID of the ticker',
    example: 'ticker-123',
  })
  tickerId!: string;

  @ApiProperty({
    description: 'Number of shares possessed',
    example: 150.5,
  })
  shares!: number;

  @ApiProperty({
    description: 'Total monetary amount invested',
    example: 15000.75,
  })
  amount!: number;
}
