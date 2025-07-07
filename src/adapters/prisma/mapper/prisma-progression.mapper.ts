import { EntityMapper } from '../../../core/base/entity-mapper';
import { Progression, ProgressionType } from '../../../core/domain/model/Progression';
import { Progression as ProgressionEntity, $Enums } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaProgressionMapper implements EntityMapper<Progression, ProgressionEntity> {
  fromDomain(model: Progression): ProgressionEntity {
    return {
      id: model.id,
      userId: model.userId,
      entryId: model.entryId,
      type: this.mapProgressionTypeFromDomain(model.type),
      completed: model.completed,
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
    };
  }

  toDomain(entity: ProgressionEntity): Progression {
    return new Progression(
      entity.id,
      entity.userId,
      entity.entryId,
      this.mapProgressionTypeToDomain(entity.type),
      entity.completed,
      entity.updatedAt,
      entity.createdAt,
    );
  }

  private mapProgressionTypeFromDomain(type: ProgressionType): $Enums.ProgressionType {
    switch (type) {
      case ProgressionType.QUESTION:
        return $Enums.ProgressionType.question;
      case ProgressionType.LESSON:
        return $Enums.ProgressionType.lesson;
      default:
        throw new Error('Invalid progression type');
    }
  }

  private mapProgressionTypeToDomain(type: $Enums.ProgressionType): ProgressionType {
    switch (type) {
      case 'question':
        return ProgressionType.QUESTION;
      case 'lesson':
        return ProgressionType.LESSON;
      default:
        throw new Error('Invalid progression type');
    }
  }
}
