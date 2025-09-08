import { GameModuleStrategy } from './game-module-strategy';
import { CreateGameModuleCommand } from '../create-game-module.use-case';
import { FillInTheBlankModule } from '../../domain/model/FillInTheBlankModule';
import { FillInTheBlankModuleInvalidDataError } from '../../domain/error/FillInTheBlankModuleInvalidDataError';
import { GameModule } from '../../domain/model/GameModule';
import { UpdateGameModuleCommand } from '../update-game-module.use-case';
import { FillInTheBlankChoice } from '../../domain/model/FillInTheBlankChoice';

export class FillInTheBlankModuleStrategy implements GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): FillInTheBlankModule {
    if (
      !command.fillInTheBlank ||
      !command.fillInTheBlank.firstText ||
      !command.fillInTheBlank.secondText ||
      !command.fillInTheBlank.blanks ||
      command.fillInTheBlank.blanks.length < 2
    ) {
      throw new FillInTheBlankModuleInvalidDataError(
        'Fill in the blank contract is missing or insufficient blanks (at least 2 required)',
      );
    }

    const blanks = command.fillInTheBlank.blanks.map(
      (blank) =>
        new FillInTheBlankChoice({
          id: crypto.randomUUID(),
          text: blank.text,
          isCorrect: blank.isCorrect,
          correctionMessage: blank.correctionMessage,
        }),
    );

    return new FillInTheBlankModule({
      id: crypto.randomUUID(),
      lessonId: command.lessonId,
      firstText: command.fillInTheBlank.firstText,
      secondText: command.fillInTheBlank.secondText,
      blanks,
    });
  }

  updateModule(
    gameModule: GameModule,
    command: UpdateGameModuleCommand,
  ): GameModule {
    if (
      !command.fillInTheBlank ||
      !command.fillInTheBlank.firstText ||
      !command.fillInTheBlank.secondText ||
      !command.fillInTheBlank.blanks ||
      command.fillInTheBlank.blanks.length < 2
    ) {
      throw new FillInTheBlankModuleInvalidDataError(
        'Fill in the blank contract is missing or insufficient blanks (at least 2 required)',
      );
    }

    const blanks = command.fillInTheBlank.blanks.map(
      (blank) =>
        new FillInTheBlankChoice({
          id: crypto.randomUUID(),
          text: blank.text,
          isCorrect: blank.isCorrect,
          correctionMessage: blank.correctionMessage,
        }),
    );

    return new FillInTheBlankModule({
      ...gameModule,
      firstText: command.fillInTheBlank.firstText,
      secondText: command.fillInTheBlank.secondText,
      blanks,
    });
  }
}
