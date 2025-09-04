import { FillInTheBlankModule } from '../../domain/model/FillInTheBlankModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';
import { CompleteGameModuleStrategy } from './complete-game-module-strategy';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';

export class FillInTheBlankCompleteGameModuleStrategy
  implements CompleteGameModuleStrategy
{
  validate(
    fillInTheBlankModule: FillInTheBlankModule,
    command: CompleteGameModuleCommand,
  ): {
    isCorrect: boolean;
    feedback: string;
  } {
    if (!command.fillInTheBlank?.blankId) {
      throw new InvalidAnswerError('Fill in the blank option is required');
    }

    const selectedBlank = fillInTheBlankModule.blanks.find(
      (blank) => blank.id === command.fillInTheBlank!.blankId,
    );

    if (!selectedBlank) {
      throw new InvalidAnswerError('Invalid answer: option not found');
    }

    return {
      isCorrect: selectedBlank.isCorrect,
      feedback: selectedBlank.correctionMessage,
    };
  }
}
