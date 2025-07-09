import { Repository } from '../../base/repository';
import { Chapter } from '../model/Chapter';
import { ChapterOrderConflictError } from '../error/ChapterOrderConflictError';

export type ProgressionData = {
  isCompleted: boolean;
  userId: string;
};

export type ModuleData = {
  id: string;
  Progression: ProgressionData[];
};

export type LessonData = {
  id: string;
  title: string;
  description: string;
  order: number;
  modules: ModuleData[];
};

export type ChapterData = {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonData[];
};

export abstract class ChapterRepository extends Repository<Chapter> {
  abstract findAllWithLessonsDetails(userId: string): Promise<ChapterData[]>;

  async validateUniqueOrder(order: number, excludeChapterId?: string): Promise<void> {
    const existingChapters = await this.findAll();
    const conflictingChapter = existingChapters.find(
      (chapter: Chapter) =>
        chapter.order === order && chapter.id !== excludeChapterId,
    );

    if (conflictingChapter) {
      throw new ChapterOrderConflictError(order);
    }
  }

  async getNextOrder(): Promise<number> {
    const chapters = await this.findAll();
    if (chapters.length === 0) {
      return 0;
    }
    return Math.max(...chapters.map((c: Chapter) => c.order)) + 1;
  }
}
