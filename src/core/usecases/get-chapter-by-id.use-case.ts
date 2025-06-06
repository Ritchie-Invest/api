import { UseCase } from '../base/use-case';
import { Chapter } from '../domain/model/Chapter';
import { ChapterRepository } from '../domain/repository/chapter.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { ChapterNotFoundError } from '../domain/error/ChapterNotFoundError';

export type GetChapterByIdCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  chapterId: string;
};

export class GetChapterByIdUseCase
  implements UseCase<GetChapterByIdCommand, Chapter>
{
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async execute(command: GetChapterByIdCommand): Promise<Chapter> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can get chapters',
      );
    }

    const chapter = await this.chapterRepository.findById(command.chapterId);
    if (!chapter) {
      throw new ChapterNotFoundError(command.chapterId);
    }
    return chapter;
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
