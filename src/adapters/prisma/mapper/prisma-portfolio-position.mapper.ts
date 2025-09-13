import { EntityMapper } from '../../../core/base/entity-mapper';
import { PortfolioPosition } from '../../../core/domain/model/PortfolioPosition';
import { PortfolioPosition as PortfolioPositionEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaPortfolioPositionMapper
  implements EntityMapper<PortfolioPosition, PortfolioPositionEntity>
{
  fromDomain(model: PortfolioPosition): PortfolioPositionEntity {
    return {
      id: model.id,
      portfolioId: model.portfolioId,
      cash: model.cash,
      investments: model.investments,
      date: model.date,
    };
  }

  toDomain(entity: PortfolioPositionEntity): PortfolioPosition {
    return new PortfolioPosition({
      id: entity.id,
      portfolioId: entity.portfolioId,
      cash: entity.cash,
      investments: entity.investments,
      date: entity.date,
    });
  }
}
