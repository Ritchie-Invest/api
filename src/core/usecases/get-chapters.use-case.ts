import { UseCase } from '../base/use-case';
import { Chapter } from '../domain/model/Chapter';
import { ChapterRepository } from '../domain/repository/chapter.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';

export type GetChaptersCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
};

export class GetChaptersUseCase
  implements UseCase<GetChaptersCommand, Chapter[]>
{
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async execute(command: GetChaptersCommand): Promise<Chapter[]> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can get chapters',
      );
    }

    return this.chapterRepository.findAll();
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return (
      currentUser.type === UserType.ADMIN ||
      currentUser.type === UserType.SUPERADMIN
    );
  }
}
