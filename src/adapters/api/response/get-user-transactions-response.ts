import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../../core/domain/type/TransactionType';

export class GetUserTransactionItem {
  @ApiProperty()
  tickerName!: string;

  @ApiProperty()
  tickerSymbol!: string;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  volume!: number;

  @ApiProperty()
  timestamp!: Date;

  constructor(partial: Partial<GetUserTransactionItem>) {
    Object.assign(this, partial);
  }
}

export class GetUserTransactionsResponse {
  @ApiProperty({ type: [GetUserTransactionItem] })
  transactions: GetUserTransactionItem[];

  constructor(transactions: GetUserTransactionItem[]) {
    this.transactions = transactions;
  }
}
