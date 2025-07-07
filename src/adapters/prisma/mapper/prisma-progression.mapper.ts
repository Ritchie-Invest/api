import { EntityMapper } from '../../../core/base/entity-mapper';
import { Progression } from '../../../core/domain/model/Progression';
import { Progression as ProgressionEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaProgressionMapper
  implements EntityMapper<Progression, ProgressionEntity>
{
  fromDomain(model: Progression): ProgressionEntity {
    return {
      id: model.id,
      userId: model.userId,
      gameModuleId: model.gameModuleId,
      isCompleted: model.isCompleted,
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
    };
  }

  toDomain(entity: ProgressionEntity): Progression {
    return new Progression(
      entity.id,
      entity.userId,
      entity.gameModuleId,
      entity.isCompleted,
      entity.updatedAt,
      entity.createdAt,
    );
  }
}
