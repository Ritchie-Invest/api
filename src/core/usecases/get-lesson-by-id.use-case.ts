import { UseCase } from '../base/use-case';
import { Lesson } from '../domain/model/Lesson';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { LessonNotFoundError } from '../domain/error/LessonNotFoundError';

export type GetLessonByIdCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  lessonId: string;
};

export class GetLessonByIdUseCase implements UseCase<GetLessonByIdCommand, Lesson> {
  constructor(private readonly lessonRepository: LessonRepository) {}

  async execute(command: GetLessonByIdCommand): Promise<Lesson> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError('Unauthorized: Only admins can get lessons');
    }

    const lesson = await this.lessonRepository.findById(command.lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(command.lessonId);
    }
    return lesson;
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
