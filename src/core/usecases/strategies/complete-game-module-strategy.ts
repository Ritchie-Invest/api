import { GameModule } from '../../domain/model/GameModule';
import {
  CompleteGameModuleCommand,
  CompleteGameModuleResult,
} from '../complete-game-module.usecase';

export interface CompleteGameModuleStrategy {
  validateMcq(
    gameModule: GameModule,
    command: CompleteGameModuleCommand,
  ): CompleteGameModuleResult;
}
