import { UseCase } from '../base/use-case';
import { ChapterRepository } from '../domain/repository/chapter.repository';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { GameRepository } from '../domain/repository/game.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { ChapterNotFoundError } from '../domain/error/ChapterNotFoundError';

export type DeleteChapterCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  chapterId: string;
};

export class DeleteChapterUseCase
  implements UseCase<DeleteChapterCommand, void>
{
  constructor(
    private readonly chapterRepository: ChapterRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(command: DeleteChapterCommand): Promise<void> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can delete chapters',
      );
    }

    const { chapterId } = command;

    const currentChapter = await this.chapterRepository.findById(chapterId);
    if (!currentChapter) {
      throw new ChapterNotFoundError(chapterId);
    }

    const associatedLessons =
      await this.lessonRepository.findByChapter(chapterId);

    for (const lesson of associatedLessons) {
      const gamesInLesson = await this.gameRepository.findByLesson(lesson.id);
      for (const game of gamesInLesson) {
        await this.gameRepository.remove(game.id);
      }
    }

    for (const lesson of associatedLessons) {
      await this.lessonRepository.remove(lesson.id);
    }

    await this.chapterRepository.remove(chapterId);
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
