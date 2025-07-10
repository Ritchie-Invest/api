import { Lesson } from './Lesson';

export class LessonSummary extends Lesson {
  public readonly isUnlocked: boolean;
  public readonly completedModules: number;
  public readonly totalModules: number;

  constructor(
    lesson: Lesson,
    isUnlocked: boolean,
    completedModules: number,
    totalModules: number,
  ) {
    super(
      lesson.id,
      lesson.title,
      lesson.description,
      lesson.chapterId,
      lesson.order,
      lesson.isPublished,
      lesson.gameType,
      lesson.modules,
      lesson.updatedAt,
      lesson.createdAt,
    );
    this.isUnlocked = isUnlocked;
    this.completedModules = completedModules;
    this.totalModules = totalModules;
  }

  isCompleted(): boolean {
    return this.totalModules > 0 && this.completedModules === this.totalModules;
  }
}
