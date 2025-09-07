import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPortfolioPositionsRequest {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({
    required: false,
    description: 'Number of positions to return',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false, description: 'Number of positions to skip' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  constructor(userId: string, limit?: number, offset?: number) {
    this.userId = userId;
    this.limit = limit;
    this.offset = offset;
  }
}
