import { Game } from '../../../core/domain/model/Game';
import { ProfileRequest } from '../request/profile.request';
import { getGamesByLessonIdCommand } from '../../../core/usecases/get-games-by-lesson.use-case';
import { GetGamesByLessonIdResponse } from '../response/get-games-by-lesson.response';

export class getGamesByLessonIdMapper {
  static toDomain(
    currentUser: ProfileRequest,
    lessonId: string,
  ): getGamesByLessonIdCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      lessonId,
    };
  }

  static fromDomain(games: Game[]): GetGamesByLessonIdResponse {
    return new GetGamesByLessonIdResponse(
      games.map((game) => ({
        id: game.id,
        type: game.type,
        rules: game.rules,
        questions: game.questions,
        lessonId: game.lessonId,
        order: game.order !== undefined ? game.order : 0,
        isPublished: game.isPublished,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
      })),
    );
  }
}
