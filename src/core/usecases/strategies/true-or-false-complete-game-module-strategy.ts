import { CompleteGameModuleStrategy } from './complete-game-module-strategy';
import { GameModule } from '../../domain/model/GameModule';
import { TrueOrFalseModule } from '../../domain/model/TrueOrFalseModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';

export class TrueOrFalseCompleteGameModuleStrategy implements CompleteGameModuleStrategy {
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

    if (!command.trueOrFalse) {
      throw new InvalidAnswerError('True or false answer is required');
    }

    const { questionId, answer } = command.trueOrFalse;
    
    const question = gameModule.questions.find(q => q.id === questionId);
    if (!question) {
      throw new InvalidAnswerError('Question not found');
    }

    const isCorrect = question.isCorrect === answer;
    
    return {
      isCorrect,
      feedback: question.correctionMessage,
      correctChoiceId: question.id,
    };
  }
}
