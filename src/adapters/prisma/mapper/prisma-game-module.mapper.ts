import { McqModule } from '../../../core/domain/model/McqModule';
import { GaugeModule } from '../../../core/domain/model/GaugeModule';
import { ChooseAnOrderModule } from '../../../core/domain/model/ChooseAnOrderModule';
import {
  GameModule as GameModuleEntity,
  McqModule as McqModuleEntity,
  GaugeModule as GaugeModuleEntity,
  ChooseAnOrderModule as ChooseAnOrderModuleEntity,
} from '@prisma/client';
import { GameModule } from '../../../core/domain/model/GameModule';
import { EntityMapper } from '../../../core/base/entity-mapper';
import { McqChoice } from '../../../core/domain/model/McqChoice';
import { ChooseAnOrderChoice } from '../../../core/domain/model/ChooseAnOrderChoice';

export class PrismaGameModuleMapper
  implements EntityMapper<GameModule, GameModuleEntity>
{
  fromDomain(): GameModuleEntity {
    throw new Error('Not implemented.');
  }

  toDomain(
    entity: GameModuleEntity & { 
      mcq: McqModuleEntity | null;
      gauge: GaugeModuleEntity | null;
      chooseAnOrder: ChooseAnOrderModuleEntity | null;
    },
  ): GameModule {
    if (entity.mcq) {
      return new McqModule({
        id: entity.id,
        lessonId: entity.lessonId,
        question: entity.mcq.question,
        choices: ((entity.mcq.choices as any[]) || []).map(
          (choice: McqChoice) =>
            new McqChoice({
              id: choice.id ?? '',
              text: choice.text,
              isCorrect: choice.isCorrect,
              correctionMessage: choice.correctionMessage,
            }),
        ),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    }
    
    if (entity.gauge) {
      return new GaugeModule({
        id: entity.id,
        lessonId: entity.lessonId,
        question: entity.gauge.question,
        value: entity.gauge.value,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    }
    
    if (entity.chooseAnOrder) {
      return new ChooseAnOrderModule({
        id: entity.id,
        lessonId: entity.lessonId,
        question: entity.chooseAnOrder.question,
        sentences: (((entity.chooseAnOrder.sentences as unknown) as ChooseAnOrderChoice[]) || []).map(
          (sentence: ChooseAnOrderChoice) =>
            new ChooseAnOrderChoice({
              sentence: sentence.sentence,
              value: sentence.value,
            }),
        ),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    }
    
    throw new Error('Unsupported module entity');
  }
}
