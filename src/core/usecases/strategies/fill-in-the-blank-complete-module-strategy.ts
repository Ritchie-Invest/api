import { CompleteGameModuleStrategy } from './complete-game-module-strategy';
import { GameModule } from '../../domain/model/GameModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';
import { FillInTheBlankModule } from '../../domain/model/FillInTheBlankModule';

export class FillInTheBlankCompleteModuleStrategy implements CompleteGameModuleStrategy {
  validate(
    gameModule: GameModule,
    command: CompleteGameModuleCommand,
  ): {
    isCorrect: boolean;
    feedback: string;
    correctChoiceId: string;
  } {
    const fillInTheBlankModule = gameModule as FillInTheBlankModule;
    
    if (!command.fillInTheBlank) {
      return {
        isCorrect: false,
        feedback: 'Aucune réponse fournie',
        correctChoiceId: '',
      };
    }

    const correctBlank = fillInTheBlankModule.blanks.find(
      blank => blank.id === command.fillInTheBlank?.blankId && blank.isCorrect
    );
    
    if (!correctBlank) {
      return {
        isCorrect: false,
        feedback: 'Réponse invalide',
        correctChoiceId: '',
      };
    }

    return {
      isCorrect: true,
      feedback: correctBlank.correctionMessage || 'Bonne réponse !',
      correctChoiceId: correctBlank.id,
    };
  }
}
