import { CreateGameCommand } from '../../../core/usecases/create-game';
import { CreateGameRequest } from '../request/create-game.request';
import { Game } from '../../../core/domain/model/Game';
import { CreateGameResponse } from '../response/create-game.response';
import { ProfileRequest } from '../request/profile.request';

export class CreateGameMapper {
  static toDomain(
    currentUser: ProfileRequest,
    request: CreateGameRequest,
  ): CreateGameCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      type: request.type,
      rules: request.rules,
      questions: request.questions,
      lessonId: request.lessonId,
      order: request.order,
    };
  }

  static fromDomain(game: Game): CreateGameResponse {
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
