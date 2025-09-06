import { EntityMapper } from '../../../core/base/entity-mapper';
import { UserPortfolio } from '../../../core/domain/model/UserPortfolio';
import { UserPortfolio as UserPortfolioEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { Currency } from '../../../core/domain/type/Currency';

@Injectable()
export class PrismaUserPortfolioMapper implements EntityMapper<UserPortfolio, UserPortfolioEntity> {
  fromDomain(model: UserPortfolio): UserPortfolioEntity {
    return {
      id: model.id,
      userId: model.userId,
      currency: model.currency,
    };
  }

  toDomain(entity: UserPortfolioEntity): UserPortfolio {
    return new UserPortfolio({
      id: entity.id,
      userId: entity.userId,
      currency: entity.currency as Currency,
    });
  }
}