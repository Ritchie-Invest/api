import { AwardBadgesOnLessonCompletedHandler } from '../../../adapters/events/award-badges-on-lesson-completed.handler';
import {
  LESSON_COMPLETED_EVENT,
  LessonCompletedEvent,
} from '../../domain/event/lesson-completed.event';
import { CheckAndAwardBadgesUseCase } from '../check-and-award-badges.use-case';

describe('AwardBadgesOnLessonCompletedHandler', () => {
  it('calls CheckAndAwardBadgesUseCase on lesson completed', async () => {
    const useCaseMock = {
      execute: jest.fn().mockResolvedValue([]),
    };
    const handler = new AwardBadgesOnLessonCompletedHandler(
      useCaseMock as unknown as CheckAndAwardBadgesUseCase,
    );

    expect(handler.eventName).toBe(LESSON_COMPLETED_EVENT);

    const event = new LessonCompletedEvent(
      'user-1',
      'lesson-1',
      3,
      3,
      100,
      new Date(),
    );
    await handler.handle(event);

    expect(useCaseMock.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      lessonId: 'lesson-1',
      completedModules: 3,
      totalModules: 3,
    });
  });
});
