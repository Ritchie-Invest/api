import { GameModule } from '../../domain/model/GameModule';
import { TrueOrFalseModule } from '../../domain/model/TrueOrFalseModule';
import { CreateGameModuleCommand } from '../create-game-module.use-case';
import { UpdateGameModuleCommand } from '../update-game-module.use-case';
import { GameModuleStrategy } from './game-module-strategy';
import { TrueOrFalseModuleInvalidDataError } from '../../domain/error/TrueOrFalseModuleInvalidDataError';

export class TrueOrFalseModuleStrategy implements GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): GameModule {
    if (
      !command.trueOrFalse ||
      !command.trueOrFalse.sentence ||
      command.trueOrFalse.isTrue === undefined
    ) {
      throw new TrueOrFalseModuleInvalidDataError(
        'True or false data is required',
      );
    }

    return new TrueOrFalseModule({
      id: crypto.randomUUID(),
      lessonId: command.lessonId,
      sentence: command.trueOrFalse.sentence,
      isTrue: command.trueOrFalse.isTrue,
    });
  }

  updateModule(
    gameModule: GameModule,
    command: UpdateGameModuleCommand,
  ): GameModule {
    if (!(gameModule instanceof TrueOrFalseModule)) {
      throw new TrueOrFalseModuleInvalidDataError(
        'Game module is not a true or false module',
      );
    }

    if (
      !command.trueOrFalse ||
      !command.trueOrFalse.sentence ||
      command.trueOrFalse.isTrue === undefined
    ) {
      throw new TrueOrFalseModuleInvalidDataError(
        'True or false data is required',
      );
    }

    return new TrueOrFalseModule({
      id: gameModule.id,
      lessonId: gameModule.lessonId,
      sentence: command.trueOrFalse.sentence,
      isTrue: command.trueOrFalse.isTrue,
      createdAt: gameModule.createdAt,
      updatedAt: new Date(),
    });
  }
}
