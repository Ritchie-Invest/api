import { GameModule } from '../../domain/model/GameModule';
import { TrueOrFalseModule } from '../../domain/model/TrueOrFalseModule';
import { GameChoice } from '../../domain/model/GameChoice';
import { CreateGameModuleCommand } from '../create-game-module.use-case';
import { UpdateGameModuleCommand } from '../update-game-module.use-case';
import { GameModuleStrategy } from './game-module-strategy';
import { TrueOrFalseModuleInvalidDataError } from '../../domain/error/TrueOrFalseModuleInvalidDataError';

export class TrueOrFalseModuleStrategy implements GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): GameModule {
    if (!command.trueOrFalse) {
      throw new TrueOrFalseModuleInvalidDataError('True or false data is required');
    }

    const questions = command.trueOrFalse.questions.map(
      (question) =>
        new GameChoice({
          id: crypto.randomUUID(),
          text: question.text,
          isCorrect: question.isCorrect,
          correctionMessage: question.correctionMessage,
        }),
    );

    return new TrueOrFalseModule({
      id: crypto.randomUUID(),
      lessonId: command.lessonId,
      questions,
    });
  }

  updateModule(
    gameModule: GameModule,
    command: UpdateGameModuleCommand,
  ): GameModule {
    if (!(gameModule instanceof TrueOrFalseModule)) {
      throw new TrueOrFalseModuleInvalidDataError('Game module is not a true or false module');
    }

    if (!command.trueOrFalse) {
      throw new TrueOrFalseModuleInvalidDataError('True or false data is required');
    }

    const questions = command.trueOrFalse.questions.map(
      (question) =>
        new GameChoice({
          id: crypto.randomUUID(),
          text: question.text,
          isCorrect: question.isCorrect,
          correctionMessage: question.correctionMessage,
        }),
    );

    return new TrueOrFalseModule({
      id: gameModule.id,
      lessonId: gameModule.lessonId,
      questions,
      createdAt: gameModule.createdAt,
      updatedAt: new Date(),
    });
  }
}
