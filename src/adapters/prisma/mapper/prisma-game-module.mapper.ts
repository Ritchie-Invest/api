import { McqModule } from '../../../core/domain/model/McqModule';
import {
  GameModule as GameModuleEntity,
  McqModule as McqModuleEntity,
} from '@prisma/client';
import { GameModule } from '../../../core/domain/model/GameModule';
import { EntityMapper } from '../../../core/base/entity-mapper';
import { GameChoice } from '../../../core/domain/model/GameChoice';

export class PrismaGameModuleMapper
  implements EntityMapper<GameModule, GameModuleEntity>
{
  fromDomain(): GameModuleEntity {
    throw new Error('Not implemented.');
  }

  toDomain(
    entity: GameModuleEntity & { mcq: McqModuleEntity | null },
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
    throw new Error('Unsupported module entity');
  }
}
