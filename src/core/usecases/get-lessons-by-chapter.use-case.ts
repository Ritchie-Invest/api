import { UseCase } from '../base/use-case';
import { Lesson } from '../domain/model/Lesson';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';

export type getLessonsByChapterIdCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  chapterId: string;
};

export class getLessonsByChapterIdUseCase
  implements UseCase<getLessonsByChapterIdCommand, Lesson[]>
{
  constructor(private readonly lessonRepository: LessonRepository) {}

  async execute(command: getLessonsByChapterIdCommand): Promise<Lesson[]> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError('Unauthorized: Only admins can get lessons');
    }

    return this.lessonRepository.findByChapter(command.chapterId);
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
