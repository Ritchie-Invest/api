import { Lesson } from './Lesson';

export class LessonSummary extends Lesson {
  public readonly isUnlocked: boolean;
  public readonly completedModules: number;
  public readonly totalModules: number;
  public readonly gameModuleId: string | null;

  constructor(
    lesson: Lesson,
    isUnlocked: boolean,
    completedModules: number,
    totalModules: number,
    gameModuleId: string | null = null,
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
    this.gameModuleId = gameModuleId;
  }

  isCompleted(): boolean {
    return this.totalModules > 0 && this.completedModules === this.totalModules;
  }
}
