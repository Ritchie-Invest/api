import { LessonRepository } from '../domain/repository/lesson.repository';
import { Lesson } from '../domain/model/Lesson';
import { UseCase } from '../base/use-case';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';

export type CreateLessonCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  title: string;
  description: string;
  chapterId: string;
};

export class CreateLessonUseCase
  implements UseCase<CreateLessonCommand, Lesson>
{
  constructor(private readonly lessonRepository: LessonRepository) {}

  async execute(command: CreateLessonCommand): Promise<Lesson> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can create lessons',
      );
    }
    const { title, description, chapterId } = command;

    const order = await this.lessonRepository.getNextOrderInChapter(chapterId);
    await this.lessonRepository.validateUniqueOrderInChapter(chapterId, order);

    const lesson = new Lesson(
      this.generateId(),
      title,
      description,
      chapterId,
      order,
      false,
    );

    return this.lessonRepository.create(lesson);
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return (
      currentUser.type === UserType.ADMIN ||
      currentUser.type === UserType.SUPERADMIN
    );
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
