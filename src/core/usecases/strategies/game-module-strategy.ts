import { GameModule } from '../../domain/model/GameModule';
import { CreateGameModuleCommand } from '../create-game-module.usecase';

export interface GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): GameModule;
}
