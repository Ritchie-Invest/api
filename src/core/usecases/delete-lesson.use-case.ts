import { UseCase } from '../base/use-case';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { GameRepository } from '../domain/repository/game.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { LessonNotFoundError } from '../domain/error/LessonNotFoundError';

export type DeleteLessonCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  lessonId: string;
};

export class DeleteLessonUseCase implements UseCase<DeleteLessonCommand, void> {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(command: DeleteLessonCommand): Promise<void> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can delete lessons',
      );
    }

    const { lessonId } = command;

    const currentLesson = await this.lessonRepository.findById(lessonId);
    if (!currentLesson) {
      throw new LessonNotFoundError(lessonId);
    }

    const associatedGames = await this.gameRepository.findByLesson(lessonId);
    for (const game of associatedGames) {
      await this.gameRepository.remove(game.id);
    }

    await this.lessonRepository.remove(lessonId);
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
