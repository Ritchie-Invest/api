import { McqModule } from '../../domain/model/McqModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';
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
    correctChoiceId: string;
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

    const correctChoice = mcqModule.choices.find((c) => c.isCorrect);

    return {
      isCorrect: selectedChoice.isCorrect,
      feedback: selectedChoice.correctionMessage,
      correctChoiceId: correctChoice?.id || selectedChoice.id, // fallback si pas trouvé
    };
  }
}
