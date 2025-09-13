import { EntityMapper } from '../../../core/base/entity-mapper';
import { Lesson } from '../../../core/domain/model/Lesson';
import {
  Lesson as LessonEntity,
  GameModule as GameModuleEntity,
  McqModule as McqModuleEntity,
  FillInTheBlankModule as FillInTheBlankModuleEntity,
  TrueOrFalseModule as TrueOrFalseModuleEntity,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { McqModule } from '../../../core/domain/model/McqModule';
import { FillInTheBlankModule } from '../../../core/domain/model/FillInTheBlankModule';
import { TrueOrFalseModule } from '../../../core/domain/model/TrueOrFalseModule';
import { PrismaGameModuleMapper } from './prisma-game-module.mapper';

@Injectable()
export class PrismaLessonMapper implements EntityMapper<Lesson, LessonEntity> {
  private readonly mcqModuleMapper = new PrismaGameModuleMapper();

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
    } as LessonEntity;
  }

  toDomain(
    entity: LessonEntity & {
      modules?: (GameModuleEntity & {
        mcq: McqModuleEntity | null;
        fillBlank: FillInTheBlankModuleEntity | null;
        trueOrFalse: TrueOrFalseModuleEntity | null;
      })[];
    },
  ): Lesson {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      chapterId: entity.chapterId,
      order: entity.order,
      isPublished: entity.isPublished,
      modules:
        entity.modules?.map((module) => {
          if (module.mcq) {
            return this.mcqModuleMapper.toDomain({
              ...module,
              mcq: module.mcq,
              fillBlank: null,
              trueOrFalse: null,
            }) as McqModule;
          }
          if (module.fillBlank) {
            return this.mcqModuleMapper.toDomain({
              ...module,
              mcq: null,
              fillBlank: module.fillBlank,
              trueOrFalse: null,
            }) as FillInTheBlankModule;
          }
          if (module.trueOrFalse) {
            return this.mcqModuleMapper.toDomain({
              ...module,
              mcq: null,
              fillBlank: null,
              trueOrFalse: module.trueOrFalse,
            }) as TrueOrFalseModule;
          }
          throw new Error('Unsupported module type in lesson');
        }) || [],
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}
