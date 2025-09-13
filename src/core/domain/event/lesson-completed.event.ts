import { DomainEvent } from '../../base/domain-event';

export class LessonCompletedEvent implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly lessonId: string,
    public readonly completedModules: number,
    public readonly totalModules: number,
    public readonly score: number,
    public readonly completedAt: Date,
  ) {}
  [x: string]: unknown;
}

export const LESSON_COMPLETED_EVENT = 'lesson.completed';
