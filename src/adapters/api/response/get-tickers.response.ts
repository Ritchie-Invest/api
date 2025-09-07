import { ApiProperty } from '@nestjs/swagger';
import { VariationDirection } from '../../../core/domain/type/VariationDirection';
import { Currency } from '../../../core/domain/type/Currency';
import { TickerType } from '../../../core/domain/type/TickerType';

export class TickerResponse {
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

  @ApiProperty()
  price: number;

  @ApiProperty({ nullable: false })
  variation: number;

  @ApiProperty({ nullable: false })
  variationPercent: number;

  @ApiProperty({ enum: VariationDirection })
  variationDirection: VariationDirection;

  constructor(params: {
    id: string;
    name: string;
    symbol: string;
    type: TickerType;
    currency: Currency;
    price: number;
    variation: number;
    variationPercent: number;
    variationDirection: VariationDirection;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.symbol = params.symbol;
    this.type = params.type;
    this.currency = params.currency;
    this.price = params.price;
    this.variation = params.variation;
    this.variationPercent = params.variationPercent;
    this.variationDirection = params.variationDirection;
  }
}

export class GetTickersResponse {
  @ApiProperty({ type: [TickerResponse] })
  tickers: TickerResponse[];

  constructor(tickers: TickerResponse[]) {
    this.tickers = tickers;
  }
}
