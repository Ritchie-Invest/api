import { EntityMapper } from '../../../core/base/entity-mapper';
import { Unit } from '../../../core/domain/model/Unit';
import { Unit as UnitEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUnitMapper implements EntityMapper<Unit, UnitEntity> {
  fromDomain(model: Unit): UnitEntity {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      chapterId: model.chapterId,
      is_published: model.is_published,
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
    };
  }

  toDomain(entity: UnitEntity): Unit {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      chapterId: entity.chapterId,
      is_published: entity.is_published,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}
