import { EntityMapper } from '../../../core/base/entity-mapper';
import { Lesson } from '../../../core/domain/model/Lesson';
import {
  $Enums,
  Lesson as LessonEntity,
  GameModule as GameModuleEntity,
  McqModule as McqModuleEntity,
  GaugeModule as GaugeModuleEntity,
  ChooseAnOrderModule as ChooseAnOrderModuleEntity,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { GameType } from '../../../core/domain/type/GameType';
import { McqModule } from '../../../core/domain/model/McqModule';
import { GaugeModule } from '../../../core/domain/model/GaugeModule';
import { ChooseAnOrderModule } from '../../../core/domain/model/ChooseAnOrderModule';
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
      gameType: model.gameType,
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
    };
  }

  toDomain(
    entity: LessonEntity & {
      modules?: (GameModuleEntity & { 
        mcq: McqModuleEntity | null;
        gauge: GaugeModuleEntity | null;
        chooseAnOrder: ChooseAnOrderModuleEntity | null;
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
      gameType: this.mapGameTypeToDomain(entity.gameType),
      modules:
        entity.modules?.map((module) => {
          return this.mcqModuleMapper.toDomain({
            ...module,
            mcq: module.mcq,
            gauge: module.gauge,
            chooseAnOrder: module.chooseAnOrder,
          });
        }) || [],
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }

  private mapGameTypeToDomain(type: $Enums.GameType): GameType {
    switch (type) {
      case 'MCQ':
        return GameType.MCQ;
      default:
        throw new Error('Invalid game type');
    }
  }
}
