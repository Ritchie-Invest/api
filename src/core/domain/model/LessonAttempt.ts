import { DomainModel } from '../../base/domain-model';

export class LessonAttempt extends DomainModel {
  public readonly userId: string;
  public readonly lessonId: string;
  public readonly startedAt: Date;
  public finishedAt?: Date;

  constructor(
    id: string,
    userId: string,
    lessonId: string,
    startedAt: Date,
    finishedAt?: Date,
  ) {
    super(id);

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!lessonId) {
      throw new Error('Lesson ID is required');
    }

    if (!startedAt) {
      throw new Error('Started at date is required');
    }

    this.userId = userId;
    this.lessonId = lessonId;
    this.startedAt = startedAt;
    this.finishedAt = finishedAt;
  }
}
