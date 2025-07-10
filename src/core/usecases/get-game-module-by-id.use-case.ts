import { UseCase } from '../base/use-case';
import { GameModuleRepository } from '../domain/repository/game-module.repository';
import { GameModule } from '../domain/model/GameModule';
import { GameModuleNotFoundError } from '../domain/error/GameModuleNotFoundError';

export type GetGameModuleByIdCommand = {
  gameModuleId: string;
};

export class GetGameModuleByIdUseCase
  implements UseCase<GetGameModuleByIdCommand, GameModule>
{
  constructor(private readonly gameModuleRepository: GameModuleRepository) {}

  async execute(command: GetGameModuleByIdCommand): Promise<GameModule> {
    const gameModule = await this.gameModuleRepository.findById(
      command.gameModuleId,
    );
    if (!gameModule) {
      throw new GameModuleNotFoundError(command.gameModuleId);
    }
    return gameModule;
  }
}
