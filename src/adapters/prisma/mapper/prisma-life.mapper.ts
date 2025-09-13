import { EntityMapper } from '../../../core/base/entity-mapper';
import { Life } from '../../../core/domain/model/Life';
import { Life as LifeEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaLifeMapper implements EntityMapper<Life, LifeEntity> {
  fromDomain(model: Life): LifeEntity {
    return {
      id: model.id,
      userId: model.userId,
      emissionDate: model.emissionDate,
    };
  }

  toDomain(entity: LifeEntity): Life {
    return new Life(entity.id, entity.userId, entity.emissionDate);
  }
}
