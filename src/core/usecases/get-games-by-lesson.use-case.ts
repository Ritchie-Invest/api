import { UseCase } from '../base/use-case';
import { Game } from '../domain/model/Game';
import { GameRepository } from '../domain/repository/game.repository';
import { User } from '../domain/model/User';

export type getGamesByLessonIdCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  lessonId: string;
};

export class getGamesByLessonIdUseCase
  implements UseCase<getGamesByLessonIdCommand, Game[]>
{
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(command: getGamesByLessonIdCommand): Promise<Game[]> {
    return this.gameRepository.findByLesson(command.lessonId);
  }
}
