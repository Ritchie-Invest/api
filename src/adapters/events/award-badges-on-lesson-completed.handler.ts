import { DomainEvent, DomainEventHandler } from '../../core/base/domain-event';
import {
  LESSON_COMPLETED_EVENT,
  LessonCompletedEvent,
} from '../../core/domain/event/lesson-completed.event';
import { CheckAndAwardBadgesUseCase } from '../../core/usecases/check-and-award-badges.use-case';

export class AwardBadgesOnLessonCompletedHandler implements DomainEventHandler {
  public readonly eventName = LESSON_COMPLETED_EVENT;

  constructor(
    private readonly checkAndAwardBadges: CheckAndAwardBadgesUseCase,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    const e = event as unknown as LessonCompletedEvent;
    await this.checkAndAwardBadges.execute({
      userId: e.userId,
      lessonId: e.lessonId,
      completedModules: e.completedModules,
      totalModules: e.totalModules,
    });
  }
}
