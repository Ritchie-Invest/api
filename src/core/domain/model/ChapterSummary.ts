import { Chapter } from './Chapter';
import { LessonSummary } from './LessonSummary';

export class ChapterSummary extends Chapter {
  public readonly isUnlocked: boolean;
  public readonly completedLessons: number;
  public readonly totalLessons: number;
  public readonly lessons: LessonSummary[];

  constructor(
    chapter: Chapter,
    isUnlocked: boolean,
    completedLessons: number,
    totalLessons: number,
    lessons: LessonSummary[],
  ) {
    super(
      chapter.id,
      chapter.title,
      chapter.description,
      chapter.order,
      chapter.isPublished,
      chapter.updatedAt,
      chapter.createdAt,
    );
    this.isUnlocked = isUnlocked;
    this.completedLessons = completedLessons;
    this.totalLessons = totalLessons;
    this.lessons = lessons;
  }

  isCompleted(): boolean {
    return this.totalLessons > 0 && this.completedLessons === this.totalLessons;
  }
}
