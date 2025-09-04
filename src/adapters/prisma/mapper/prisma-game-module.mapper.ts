import { McqModule } from '../../../core/domain/model/McqModule';
import {
  GameModule as GameModuleEntity,
  McqModule as McqModuleEntity,
  FillInTheBlankModule as FillInTheBlankModuleEntity,
  TrueOrFalseModule as TrueOrFalseModuleEntity,
} from '@prisma/client';
import { GameModule } from '../../../core/domain/model/GameModule';
import { EntityMapper } from '../../../core/base/entity-mapper';
import { GameChoice } from '../../../core/domain/model/GameChoice';
import { FillInTheBlankModule } from '../../../core/domain/model/FillInTheBlankModule';
import { TrueOrFalseModule } from '../../../core/domain/model/TrueOrFalseModule';

export class PrismaGameModuleMapper
  implements EntityMapper<GameModule, GameModuleEntity>
{
  fromDomain(): GameModuleEntity {
    throw new Error('Not implemented.');
  }

  toDomain(
    entity: GameModuleEntity & { 
      mcq: McqModuleEntity | null;
      fillBlank: FillInTheBlankModuleEntity | null;
      trueOrFalse: TrueOrFalseModuleEntity | null;
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
    if (entity.fillBlank) {
      return new FillInTheBlankModule({
        id: entity.id,
        lessonId: entity.lessonId,
        firstText: entity.fillBlank.firstText,
        secondText: entity.fillBlank.secondText,
        blanks: ((entity.fillBlank.blanks as any[]) || []).map(
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
    if (entity.trueOrFalse) {
      return new TrueOrFalseModule({
        id: entity.id,
        lessonId: entity.lessonId,
        questions: ((entity.trueOrFalse.questions as any[]) || []).map(
          (question: GameChoice) =>
            new GameChoice({
              id: question.id ?? '',
              text: question.text,
              isCorrect: question.isCorrect,
              correctionMessage: question.correctionMessage,
            }),
        ),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    }
    throw new Error('Unsupported module entity');
  }
}
