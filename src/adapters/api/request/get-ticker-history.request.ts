import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class GetTickerHistoryRequest {
  @ApiProperty({
    description: 'ID of the ticker to get history for',
    example: 'ticker-1',
  })
  @IsNotEmpty()
  @IsString()
  tickerId!: string;

  @ApiProperty({
    description: 'Number of days to retrieve (max 365)',
    example: 30,
    minimum: 1,
    maximum: 365,
  })
  @IsInt()
  @Min(1)
  @Max(365)
  limit!: number;
}
