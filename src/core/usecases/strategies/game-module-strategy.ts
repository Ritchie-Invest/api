import { GameModule } from '../../domain/model/GameModule';
import { CreateGameModuleCommand } from '../create-game-module.use-case';
import { UpdateGameModuleCommand } from '../update-game-module.use-case';

export interface GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): GameModule;

  updateModule(
    gameModule: GameModule,
    command: UpdateGameModuleCommand,
  ): GameModule;
}
