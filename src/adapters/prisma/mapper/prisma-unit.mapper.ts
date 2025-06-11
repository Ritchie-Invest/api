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
      isPublished: model.isPublished,
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
      isPublished: entity.isPublished,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}
