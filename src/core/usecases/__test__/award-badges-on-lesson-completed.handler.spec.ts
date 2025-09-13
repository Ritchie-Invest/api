import { AwardBadgesOnLessonCompletedHandler } from '../handlers/award-badges-on-lesson-completed.handler';
import {
  LESSON_COMPLETED_EVENT,
  LessonCompletedEvent,
} from '../../domain/event/lesson-completed.event';
import { BadgeAwardingService } from '../../domain/service/badge-awarding.service';

describe('AwardBadgesOnLessonCompletedHandler', () => {
  it('calls BadgeAwardingService on lesson completed', async () => {
    const badgeService = {
      checkAndAward: jest.fn().mockResolvedValue([]),
    };
    const handler = new AwardBadgesOnLessonCompletedHandler(
      badgeService as unknown as BadgeAwardingService,
    );

    expect(handler.eventName).toBe(LESSON_COMPLETED_EVENT);

    const event = new LessonCompletedEvent('u1', 'l1', 3, 3, 100, new Date());
    await handler.handle(event);

    expect(badgeService.checkAndAward).toHaveBeenCalledWith('u1', 'l1', 3, 3);
  });
});
