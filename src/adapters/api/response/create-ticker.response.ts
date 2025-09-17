import { ApiProperty } from '@nestjs/swagger';
import { TickerType } from '../../../core/domain/type/TickerType';
import { Currency } from '../../../core/domain/type/Currency';

export class CreateTickerResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty({ enum: TickerType })
  type: TickerType;

  @ApiProperty({ enum: Currency })
  currency: Currency;

  constructor(params: {
    id: string;
    name: string;
    symbol: string;
    type: TickerType;
    currency: Currency;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.symbol = params.symbol;
    this.type = params.type;
    this.currency = params.currency;
  }
}
