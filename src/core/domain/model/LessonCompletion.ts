import { DomainModel } from '../../base/domain-model';

export class LessonCompletion extends DomainModel {
  public readonly userId: string;
  public readonly lessonId: string;
  public readonly score: number;
  public readonly completedAt: Date;

  constructor(
    id: string,
    userId: string,
    lessonId: string,
    score: number,
    completedAt: Date,
  ) {
    super(id);

    if (!id) {
      throw new Error('ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!lessonId) {
      throw new Error('Lesson ID is required');
    }

    if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    if (!completedAt) {
      throw new Error('Completed at date is required');
    }

    this.id = id;
    this.userId = userId;
    this.lessonId = lessonId;
    this.score = score;
    this.completedAt = completedAt;
  }
}
