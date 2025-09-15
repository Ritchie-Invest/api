import { CompleteGameModuleStrategy } from './complete-game-module-strategy';
import { GameModule } from '../../domain/model/GameModule';
import { TrueOrFalseModule } from '../../domain/model/TrueOrFalseModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';

export class TrueOrFalseCompleteGameModuleStrategy
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
    if (!(gameModule instanceof TrueOrFalseModule)) {
      throw new InvalidAnswerError('Game module is not a true or false module');
    }

    if (command.trueOrFalse === undefined) {
      throw new InvalidAnswerError('True or false answer is required');
    }

    const userAnswer = command.trueOrFalse;
    const correctAnswer = gameModule.isTrue;
    const isCorrect = userAnswer === correctAnswer;

    return {
      isCorrect,
      feedback: isCorrect
        ? 'Correct! Well done.'
        : `Incorrect. The correct answer is: ${correctAnswer ? 'True' : 'False'}`,
      correctChoiceId: gameModule.id,
    };
  }
}
