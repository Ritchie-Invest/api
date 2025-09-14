import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length, Matches } from 'class-validator';
import { TickerType } from '../../../core/domain/type/TickerType';
import { Currency } from '../../../core/domain/type/Currency';

export class CreateTickerRequest {
  @ApiProperty({ example: 'S&P 500 ETF' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    example: 'SPY',
    description: 'Unique symbol (letters/numbers)',
  })
  @IsString()
  @Length(1, 12)
  @Matches(/^[A-Za-z0-9._-]+$/)
  symbol: string;

  @ApiProperty({ enum: TickerType, example: TickerType.ETF })
  @IsEnum(TickerType)
  type: TickerType;

  @ApiProperty({ enum: Currency, example: Currency.USD })
  @IsEnum(Currency)
  currency: Currency;

  constructor(
    name: string,
    symbol: string,
    type: TickerType,
    currency: Currency,
  ) {
    this.name = name;
    this.symbol = symbol;
    this.type = type;
    this.currency = currency;
  }
}
