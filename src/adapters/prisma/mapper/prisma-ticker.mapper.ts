import { Injectable } from '@nestjs/common';
import { EntityMapper } from '../../../core/base/entity-mapper';
import { Ticker } from '../../../core/domain/model/Ticker';
import { Currency as DomainCurrency } from '../../../core/domain/type/Currency';
import { TickerType as DomainTickerType } from '../../../core/domain/type/TickerType';
import {
  Ticker as TickerEntity,
  $Enums,
  DailyBar as DailyBarEntity,
} from '@prisma/client';
import { PrismaDailyBarMapper } from './prisma-daily-bar.mapper';

@Injectable()
export class PrismaTickerMapper implements EntityMapper<Ticker, TickerEntity> {
  private readonly dailyBarMapper = new PrismaDailyBarMapper();

  fromDomain(model: Ticker): TickerEntity {
    return {
      id: model.id,
      name: model.name,
      symbol: model.symbol,
      type: this.mapTickerTypeToPrisma(model.type),
      currency: this.mapCurrencyToPrisma(model.currency),
    };
  }

  toDomain(entity: TickerEntity & { history?: DailyBarEntity[] }): Ticker {
    return new Ticker({
      id: entity.id,
      name: entity.name,
      symbol: entity.symbol,
      type: this.mapTickerTypeToDomain(entity.type),
      currency: this.mapCurrencyToDomain(entity.currency),
      history: (entity.history || []).map((h) =>
        this.dailyBarMapper.toDomain(h),
      ),
    });
  }

  private mapCurrencyToPrisma(c: DomainCurrency): $Enums.Currency {
    switch (c) {
      case DomainCurrency.USD:
        return 'USD';
      case DomainCurrency.EUR:
        return 'EUR';
      case DomainCurrency.GBP:
        return 'GBP';
      default:
        throw new Error('Invalid currency');
    }
  }

  private mapCurrencyToDomain(c: $Enums.Currency): DomainCurrency {
    switch (c) {
      case 'USD':
        return DomainCurrency.USD;
      case 'EUR':
        return DomainCurrency.EUR;
      case 'GBP':
        return DomainCurrency.GBP;
      default:
        throw new Error('Invalid currency');
    }
  }

  private mapTickerTypeToPrisma(t: DomainTickerType): $Enums.TickerType {
    switch (t) {
      case DomainTickerType.ETF:
        return 'ETF';
      default:
        throw new Error('Invalid ticker type');
    }
  }

  private mapTickerTypeToDomain(t: $Enums.TickerType): DomainTickerType {
    switch (t) {
      case 'ETF':
        return DomainTickerType.ETF;
      default:
        throw new Error('Invalid ticker type');
    }
  }
}
