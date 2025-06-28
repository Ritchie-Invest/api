import { Game } from '../../../core/domain/model/Game';
import { ProfileRequest } from '../request/profile.request';
import { GetGameByIdCommand } from '../../../core/usecases/get-game-by-id.use-case';
import { GetGameByIdResponse } from '../response/get-game-by-id.response';

export class GetGameByIdMapper {
  static toDomain(
    currentUser: ProfileRequest,
    gameId: string,
  ): GetGameByIdCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      gameId: gameId,
    };
  }

  static fromDomain(game: Game): GetGameByIdResponse {
    return {
      id: game.id,
      type: game.type,
      rules: game.rules,
      questions: game.questions,
      lessonId: game.lessonId,
      order: game.order !== undefined ? game.order : 0,
      isPublished: game.isPublished,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  }
}
