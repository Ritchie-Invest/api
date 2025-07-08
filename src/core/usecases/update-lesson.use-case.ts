import { UseCase } from '../base/use-case';
import { Lesson } from '../domain/model/Lesson';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { LessonNotFoundError } from '../domain/error/LessonNotFoundError';
import { OrderValidationService } from '../domain/service/order-validation.service';

export type UpdateLessonCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  lessonId: string;
  title: string;
  description: string;
  order?: number;
  isPublished: boolean;
};

export class UpdateLessonUseCase
  implements UseCase<UpdateLessonCommand, Lesson>
{
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly orderValidationService: OrderValidationService,
  ) {}

  async execute(command: UpdateLessonCommand): Promise<Lesson> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can update lessons',
      );
    }

    const { lessonId, title, description, order } = command;

    const currentLesson = await this.lessonRepository.findById(lessonId);
    if (!currentLesson) {
      throw new LessonNotFoundError(lessonId);
    }

    if (order !== undefined && order !== currentLesson.order) {
      await this.orderValidationService.validateLessonOrder(
        this.lessonRepository,
        currentLesson.chapterId,
        order,
        lessonId,
      );
    }

    const lesson = new Lesson(
      currentLesson.id,
      title ?? currentLesson.title,
      description ?? currentLesson.description,
      currentLesson.chapterId,
      order ?? currentLesson.order,
      command.isPublished ?? currentLesson.isPublished,
      currentLesson.gameType,
      currentLesson.modules,
      currentLesson.updatedAt,
      currentLesson.createdAt,
    );

    const updatedLesson = await this.lessonRepository.update(lessonId, lesson);
    if (!updatedLesson) {
      throw new LessonNotFoundError(lessonId);
    }
    return updatedLesson;
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
