import { EntityMapper } from '../../../core/base/entity-mapper';
import { Chapter } from '../../../core/domain/model/Chapter';
import { Chapter as ChapterEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaChapterMapper
  implements EntityMapper<Chapter, ChapterEntity>
{
  fromDomain(model: Chapter): ChapterEntity {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      order: model.order,
      isPublished: model.isPublished,
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
    };
  }

  toDomain(entity: ChapterEntity): Chapter {
    return new Chapter(
      entity.id,
      entity.title,
      entity.description,
      entity.order,
      entity.isPublished,
      entity.updatedAt,
      entity.createdAt,
    );
  }
}
