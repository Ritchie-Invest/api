import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { TransactionType } from '../../../core/domain/type/TransactionType';

export class ExecuteTransactionRequest {
  @ApiProperty()
  @IsString()
  tickerId: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  constructor(tickerId: string, type: TransactionType, amount: number) {
    this.tickerId = tickerId;
    this.type = type;
    this.amount = amount;
  }
}
