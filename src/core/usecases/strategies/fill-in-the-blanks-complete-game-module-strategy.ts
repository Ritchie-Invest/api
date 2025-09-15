import { FillInTheBlankModule } from '../../domain/model/FillInTheBlankModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';
import { CompleteGameModuleStrategy } from './complete-game-module-strategy';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';
import { GameModule } from '../../domain/model/GameModule';

export class FillInTheBlankCompleteGameModuleStrategy
  implements CompleteGameModuleStrategy
{
  validate(
    gameModule: GameModule,
    command: CompleteGameModuleCommand,
  ): {
    isCorrect: boolean;
    feedback: string;
    correctChoiceId: string;
  } {
    const fillInTheBlankModule = gameModule as FillInTheBlankModule;
    if (!command.fillInTheBlank?.blankId) {
      throw new InvalidAnswerError('Fill in the blank choice ID is required');
    }

    const selectedBlank = fillInTheBlankModule.blanks.find(
      (blank) => blank.id === command.fillInTheBlank!.blankId,
    );

    if (!selectedBlank) {
      throw new InvalidAnswerError('Invalid blank choice ID');
    }

    const correctBlank = fillInTheBlankModule.blanks.find(
      (blank) => blank.isCorrect,
    );

    return {
      isCorrect: selectedBlank.isCorrect,
      feedback: selectedBlank.correctionMessage,
      correctChoiceId: correctBlank?.id || '',
    };
  }
}
