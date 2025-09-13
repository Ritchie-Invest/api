import { DomainEvent, DomainEventHandler } from '../../base/domain-event';
import {
  LESSON_COMPLETED_EVENT,
  LessonCompletedEvent,
} from '../../domain/event/lesson-completed.event';
import { BadgeAwardingService } from '../../domain/service/badge-awarding.service';

export class AwardBadgesOnLessonCompletedHandler implements DomainEventHandler {
  public readonly eventName = LESSON_COMPLETED_EVENT;

  constructor(private readonly badgeAwardingService: BadgeAwardingService) {}

  async handle(event: DomainEvent): Promise<void> {
    const e = event as unknown as LessonCompletedEvent;
    await this.badgeAwardingService.checkAndAward(
      e.userId,
      e.lessonId,
      e.completedModules,
      e.totalModules,
    );
  }
}
