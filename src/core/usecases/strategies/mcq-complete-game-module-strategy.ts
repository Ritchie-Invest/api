import { McqModule } from '../../domain/model/McqModule';
import { GameModule } from '../../domain/model/GameModule';
import { CompleteGameModuleCommand } from '../complete-game-module.usecase';
import {
  CompleteGameModuleStrategy,
  CompleteGameModuleResult,
} from './complete-game-module-strategy';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';
import { GameModuleTypeMismatchError } from '../../domain/error/GameModuleTypeMismatchError';

export class McqCompleteGameModuleStrategy
  implements CompleteGameModuleStrategy
{
  validateAndComplete(
    gameModule: GameModule,
    command: CompleteGameModuleCommand,
  ): CompleteGameModuleResult {
    if (!(gameModule instanceof McqModule)) {
      throw new GameModuleTypeMismatchError();
    }

    if (!command.mcq?.choiceId) {
      throw new InvalidAnswerError('MCQ choice is required');
    }

    const selectedChoice = gameModule.choices.find(
      (choice) => choice.id === command.mcq!.choiceId,
    );

    if (!selectedChoice) {
      throw new InvalidAnswerError('Invalid choice selected');
    }

    return {
      correctAnswer: selectedChoice.isCorrect,
      feedback: selectedChoice.correctionMessage,
    };
  }
}
