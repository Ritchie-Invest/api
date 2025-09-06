import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetPortfolioRequest {
  @ApiProperty()
  @IsString()
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
