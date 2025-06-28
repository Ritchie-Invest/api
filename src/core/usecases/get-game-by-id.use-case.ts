import { UseCase } from '../base/use-case';
import { Game } from '../domain/model/Game';
import { GameRepository } from '../domain/repository/game.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { GameNotFoundError } from '../domain/error/GameNotFoundError';

export type GetGameByIdCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  gameId: string;
};

export class GetGameByIdUseCase implements UseCase<GetGameByIdCommand, Game> {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(command: GetGameByIdCommand): Promise<Game> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError('Unauthorized: Only admins can get games');
    }

    const game = await this.gameRepository.findById(command.gameId);
    if (!game) {
      throw new GameNotFoundError(command.gameId);
    }
    return game;
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
