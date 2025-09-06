import { EntityMapper } from '../../../core/base/entity-mapper';
import { PortfolioValue } from '../../../core/domain/model/PortfolioValue';
import { PortfolioValue as PortfolioValueEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaPortfolioValueMapper implements EntityMapper<PortfolioValue, PortfolioValueEntity> {
  fromDomain(model: PortfolioValue): PortfolioValueEntity {
    return {
      id: model.id,
      portfolioId: model.portfolioId,
      cash: model.cash,
      investments: model.investments,
      date: model.date,
    };
  }

  toDomain(entity: PortfolioValueEntity): PortfolioValue {
    return new PortfolioValue({
      id: entity.id,
      portfolioId: entity.portfolioId,
      cash: entity.cash,
      investments: entity.investments,
      date: entity.date,
    });
  }
}