import { ProfileRequest } from '../request/profile.request';
import { DeleteGameResponse } from '../response/delete-game.response';
import { DeleteGameCommand } from '../../../core/usecases/delete-game.use-case';

export class DeleteGameMapper {
  static toDomain(
    currentUser: ProfileRequest,
    gameId: string,
  ): DeleteGameCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      gameId: gameId,
    };
  }

  static fromDomain(gameId: string): DeleteGameResponse {
    return new DeleteGameResponse(gameId);
  }
}
