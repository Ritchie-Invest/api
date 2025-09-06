import { GameModuleStrategy } from './game-module-strategy';
import { GameChoice } from '../../domain/model/GameChoice';
import { CreateGameModuleCommand } from '../create-game-module.use-case';
import { FillInTheBlankModule } from '../../domain/model/FillInTheBlankModule';
import { FillInTheBlankModuleInvalidDataError } from '../../domain/error/FillInTheBlankModuleInvalidDataError';
import { GameModule } from '../../domain/model/GameModule';
import { UpdateGameModuleCommand } from '../update-game-module.use-case';

export class FillInTheBlankModuleStrategy implements GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): FillInTheBlankModule {
    if (!command.fillInTheBlank || !command.fillInTheBlank.firstText || !command.fillInTheBlank.secondText || !command.fillInTheBlank.blanks) {
      throw new FillInTheBlankModuleInvalidDataError('Fill in the blank contract is missing');
    }
    return new FillInTheBlankModule({
      id: crypto.randomUUID(),
      lessonId: command.lessonId,
      firstText: command.fillInTheBlank.firstText,
      secondText: command.fillInTheBlank.secondText,
      blanks: command.fillInTheBlank.blanks.map(
        (b) =>
          new GameChoice({
            id: crypto.randomUUID(),
            text: b.text,
            isCorrect: b.isCorrect,
            correctionMessage: b.correctionMessage,
          }),
      ),
    });
  }

  updateModule(
    gameModule: GameModule,
    command: UpdateGameModuleCommand,
  ): GameModule {
    if (!command.fillInTheBlank || !command.fillInTheBlank.firstText || !command.fillInTheBlank.secondText || !command.fillInTheBlank.blanks) {
      throw new FillInTheBlankModuleInvalidDataError('Fill in the blank contract is missing');
    }

    return new FillInTheBlankModule({
      ...gameModule,
      firstText: command.fillInTheBlank.firstText,
      secondText: command.fillInTheBlank.secondText,
      blanks: command.fillInTheBlank.blanks.map(
        (b) =>
          new GameChoice({
            id: crypto.randomUUID(),
            text: b.text,
            isCorrect: b.isCorrect,
            correctionMessage: b.correctionMessage,
          }),
      ),
    });
  }
}
