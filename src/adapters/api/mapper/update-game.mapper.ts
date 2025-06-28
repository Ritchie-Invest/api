import { Game } from '../../../core/domain/model/Game';
import { ProfileRequest } from '../request/profile.request';
import { UpdateGameRequest } from '../request/update-game.request';
import { UpdateGameResponse } from '../response/update-game.response';
import { UpdateGameCommand } from '../../../core/usecases/update-game.use-case';

export class UpdateGameMapper {
  static toDomain(
    currentUser: ProfileRequest,
    gameId: string,
    request: UpdateGameRequest,
  ): UpdateGameCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      gameId: gameId,
      type: request.type,
      rules: request.rules,
      questions: request.questions,
      lessonId: '', // This will be handled by the use case from existing game
      order: request.order,
      isPublished: request.isPublished,
    };
  }

  static fromDomain(game: Game): UpdateGameResponse {
    return {
      id: game.id,
      type: game.type,
      rules: game.rules,
      questions: game.questions,
      lessonId: game.lessonId,
      order: game.order ?? 0,
      isPublished: game.isPublished,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  }
}
