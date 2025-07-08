import { McqModule } from '../../domain/model/McqModule';
import { CompleteGameModuleCommand } from '../complete-game-module.usecase';
import { CompleteGameModuleStrategy } from './complete-game-module-strategy';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';

export class McqCompleteGameModuleStrategy
  implements CompleteGameModuleStrategy
{
  validate(
    mcqModule: McqModule,
    command: CompleteGameModuleCommand,
  ): {
    isCorrect: boolean;
    feedback: string;
  } {
    if (!command.mcq?.choiceId) {
      throw new InvalidAnswerError('MCQ choice is required');
    }

    const selectedChoice = mcqModule.choices.find(
      (choice) => choice.id === command.mcq!.choiceId,
    );

    if (!selectedChoice) {
      throw new InvalidAnswerError('Invalid answer: choice not found');
    }

    return {
      isCorrect: selectedChoice.isCorrect,
      feedback: selectedChoice.correctionMessage,
    };
  }
}
