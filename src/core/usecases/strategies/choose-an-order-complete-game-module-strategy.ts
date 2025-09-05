import { GameModule } from '../../domain/model/GameModule';
import { ChooseAnOrderModule } from '../../domain/model/ChooseAnOrderModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';
import { CompleteGameModuleStrategy } from './complete-game-module-strategy';

export class ChooseAnOrderCompleteGameModuleStrategy implements CompleteGameModuleStrategy {
  validate(
    gameModule: GameModule,
    command: CompleteGameModuleCommand,
  ): {
    isCorrect: boolean;
    feedback: string;
    correctChoiceId: string;
  } {
    if (!(gameModule instanceof ChooseAnOrderModule)) {
      throw new Error('Game module must be a ChooseAnOrderModule');
    }
    if (!command.chooseAnOrder) {
      throw new Error('ChooseAnOrder answer is required');
    }

    const correctOrder = gameModule.sentences
      .sort((a, b) => a.value - b.value)
      .map(s => s.value);
    
    const userOrder = command.chooseAnOrder.orderedSentenceValues;
    
    const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
    
    const feedback = isCorrect 
      ? 'Perfect! You got the correct order.'
      : `Not quite right. The correct order should be: ${correctOrder.join(', ')}, but you provided: ${userOrder.join(', ')}.`;

    return {
      isCorrect,
      feedback,
      correctChoiceId: correctOrder.join(','),
    };
  }
}
