import { EntityMapper } from '../../../core/base/entity-mapper';
import { PortfolioTicker } from '../../../core/domain/model/PortfolioTicker';
import { PortfolioTicker as PortfolioTickerEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaPortfolioTickerMapper implements EntityMapper<PortfolioTicker, PortfolioTickerEntity> {
  fromDomain(model: PortfolioTicker): PortfolioTickerEntity {
    return {
      id: model.id,
      portfolioId: model.portfolioId,
      tickerId: model.tickerId,
      value: model.value,
      shares: model.shares,
      date: model.date,
    };
  }

  toDomain(entity: PortfolioTickerEntity): PortfolioTicker {
    return new PortfolioTicker({
      id: entity.id,
      portfolioId: entity.portfolioId,
      tickerId: entity.tickerId,
      value: entity.value,
      shares: entity.shares,
      date: entity.date,
    });
  }
}