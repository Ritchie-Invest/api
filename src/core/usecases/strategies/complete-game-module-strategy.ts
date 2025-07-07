import { GameModule } from '../../domain/model/GameModule';
import { CompleteGameModuleCommand } from '../complete-game-module.usecase';

export interface CompleteGameModuleResult {
  correctAnswer: boolean;
  feedback: string;
}

export interface CompleteGameModuleStrategy {
  validateAndComplete(
    gameModule: GameModule,
    command: CompleteGameModuleCommand,
  ): CompleteGameModuleResult;
}
