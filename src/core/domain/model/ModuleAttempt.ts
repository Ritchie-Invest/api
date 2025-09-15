import { DomainModel } from '../../base/domain-model';

export class ModuleAttempt extends DomainModel {
  public readonly userId: string;
  public readonly gameModuleId: string;
  public readonly lessonAttemptId: string;
  public readonly isCorrect: boolean;
  public readonly answeredAt: Date;

  constructor(
    id: string,
    userId: string,
    gameModuleId: string,
    lessonAttemptId: string,
    isCorrect: boolean,
    answeredAt: Date,
  ) {
    super(
      `Module attempt with id ${id} for user ${userId} and game module ${gameModuleId}`,
    );

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!gameModuleId) {
      throw new Error('Game module ID is required');
    }

    if (!lessonAttemptId) {
      throw new Error('Lesson attempt ID is required');
    }

    if (answeredAt === undefined || answeredAt === null) {
      throw new Error('Answered at date is required');
    }

    this.userId = userId;
    this.gameModuleId = gameModuleId;
    this.lessonAttemptId = lessonAttemptId;
    this.isCorrect = isCorrect;
    this.answeredAt = answeredAt;
  }
}
