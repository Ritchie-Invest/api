import { UseCase } from '../base/use-case';
import { GameRepository } from '../domain/repository/game.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { GameNotFoundError } from '../domain/error/GameNotFoundError';

export type DeleteGameCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  gameId: string;
};

export class DeleteGameUseCase implements UseCase<DeleteGameCommand, void> {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(command: DeleteGameCommand): Promise<void> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can delete games',
      );
    }

    const { gameId } = command;

    const currentGame = await this.gameRepository.findById(gameId);
    if (!currentGame) {
      throw new GameNotFoundError(gameId);
    }

    await this.gameRepository.remove(gameId);
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
