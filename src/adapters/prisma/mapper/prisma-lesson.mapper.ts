import { EntityMapper } from '../../../core/base/entity-mapper';
import { Lesson } from '../../../core/domain/model/Lesson';
import { Lesson as LessonEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaLessonMapper implements EntityMapper<Lesson, LessonEntity> {
  fromDomain(model: Lesson): LessonEntity {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      chapterId: model.chapterId,
      order: model.order ?? 0,
      isPublished: model.isPublished,
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
    };
  }

  toDomain(entity: LessonEntity): Lesson {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      chapterId: entity.chapterId,
      order: entity.order,
      isPublished: entity.isPublished,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}
