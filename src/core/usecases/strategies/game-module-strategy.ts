import { GameModule } from '../../domain/model/GameModule';
import { CreateGameModuleCommand } from '../create-game-module.use-case';

export interface GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): GameModule;
}
