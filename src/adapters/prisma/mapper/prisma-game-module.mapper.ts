import { McqModule } from '../../../core/domain/model/McqModule';
import {
  GameModule as GameModuleEntity,
  McqModule as McqModuleEntity,
  FillInTheBlankModule as FillInTheBlankModuleEntity,
} from '@prisma/client';
import { GameModule } from '../../../core/domain/model/GameModule';
import { EntityMapper } from '../../../core/base/entity-mapper';
import { GameChoice } from '../../../core/domain/model/GameChoice';
import { FillInTheBlankModule } from '../../../core/domain/model/FillInTheBlankModule';

export class PrismaGameModuleMapper
  implements EntityMapper<GameModule, GameModuleEntity>
{
  fromDomain(): GameModuleEntity {
    throw new Error('Not implemented.');
  }

  toDomain(
    entity: GameModuleEntity & { 
      mcq: McqModuleEntity | null;
      fillblank: FillInTheBlankModuleEntity | null;
    },
  ): GameModule {
    if (entity.mcq) {
      return new McqModule({
        id: entity.id,
        lessonId: entity.lessonId,
        question: entity.mcq.question,
        choices: ((entity.mcq.choices as any[]) || []).map(
          (choice: GameChoice) =>
            new GameChoice({
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
    if (entity.fillblank) {
      return new FillInTheBlankModule({
        id: entity.id,
        lessonId: entity.lessonId,
        firstText: entity.fillblank.firstText,
        secondText: entity.fillblank.secondText,
        blanks: ((entity.fillblank.blanks as any[]) || []).map(
          (blank: GameChoice) =>
            new GameChoice({
              id: blank.id ?? '',
              text: blank.text,
              isCorrect: blank.isCorrect,
              correctionMessage: blank.correctionMessage,
            }),
        ),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    }
    throw new Error('Unsupported module entity');
  }
}
