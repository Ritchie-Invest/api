import { McqModule } from '../../domain/model/McqModule';
import {
  CompleteGameModuleCommand,
  CompleteGameModuleResult,
} from '../complete-game-module.usecase';
import { CompleteGameModuleStrategy } from './complete-game-module-strategy';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';

export class McqCompleteGameModuleStrategy
  implements CompleteGameModuleStrategy
{
  validateMcq(
    gameModule: McqModule,
    command: CompleteGameModuleCommand,
  ): CompleteGameModuleResult {
    if (!command.mcq?.choiceId) {
      throw new InvalidAnswerError('MCQ choice is required');
    }

    const selectedChoice = gameModule.choices.find(
      (choice) => choice.id === command.mcq!.choiceId,
    );

    if (!selectedChoice) {
      throw new InvalidAnswerError('Invalid answer: choice not found');
    }

    return {
      correctAnswer: selectedChoice.isCorrect,
      feedback: selectedChoice.correctionMessage,
      nextGameModuleId: null, // TODO: Implement logic to find next game module
      currentGameModuleIndex: 0, // TODO: Implement logic to find current index
      totalGameModules: 1, // TODO: Implement logic to count total modules
    };
  }
}
