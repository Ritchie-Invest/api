import { McqModule } from '../../../core/domain/model/McqModule';
import { MatchModule } from '../../../core/domain/model/MatchModule';
import {
  GameModule as GameModuleEntity,
  McqModule as McqModuleEntity,
  MatchModule as MatchModuleEntity,
} from '@prisma/client';
import { GameModule } from '../../../core/domain/model/GameModule';
import { EntityMapper } from '../../../core/base/entity-mapper';
import { McqChoice } from '../../../core/domain/model/McqChoice';
import { MatchChoice } from '../../../core/domain/model/MatchChoice';

export class PrismaGameModuleMapper
  implements EntityMapper<GameModule, GameModuleEntity>
{
  fromDomain(): GameModuleEntity {
    throw new Error('Not implemented.');
  }

  toDomain(
    entity: GameModuleEntity & { 
      mcq: McqModuleEntity | null;
      match: MatchModuleEntity | null;
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

    if (entity.match) {
      return new MatchModule({
        id: entity.id,
        lessonId: entity.lessonId,
        instruction: entity.match.instruction,
        matches: ((entity.match.matches as any[]) || []).map(
          (match: MatchChoice) =>
            new MatchChoice({
              id: match.id ?? '',
              value1: match.value1,
              value2: match.value2,
            }),
        ),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    }
    throw new Error('Unsupported module entity');
  }
}
