import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetTickerPossessedValueRequest {
  @ApiProperty({
    description: 'ID of the ticker',
    example: 'ticker-123',
  })
  @IsString()
  @IsNotEmpty()
  tickerId!: string;
}
