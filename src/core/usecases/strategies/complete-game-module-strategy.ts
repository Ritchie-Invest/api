import { GameModule } from '../../domain/model/GameModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';

export interface CompleteGameModuleStrategy {
  validate(
    gameModule: GameModule,
    command: CompleteGameModuleCommand,
  ): {
    isCorrect: boolean;
    feedback: string;
    correctChoiceId: string;
  };
}
