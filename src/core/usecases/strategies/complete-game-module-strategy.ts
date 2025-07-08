import { GameModule } from '../../domain/model/GameModule';
import { CompleteGameModuleCommand } from '../complete-game-module.usecase';

export interface CompleteGameModuleStrategy {
  validate(
    gameModule: GameModule,
    command: CompleteGameModuleCommand,
  ): {
    isCorrect: boolean;
    feedback: string;
  };
}
