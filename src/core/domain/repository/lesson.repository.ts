import { Repository } from '../../base/repository';
import { Lesson } from '../model/Lesson';
import { LessonOrderConflictError } from '../error/LessonOrderConflictError';

export abstract class LessonRepository extends Repository<Lesson> {
  abstract findByChapter(chapterId: string): Promise<Lesson[]> | Lesson[];

  async validateUniqueOrderInChapter(
    chapterId: string,
    order: number,
    excludeLessonId?: string,
  ): Promise<void> {
    const existingLessons = await this.findByChapter(chapterId);
    const conflictingLesson = existingLessons.find(
      (lesson: Lesson) =>
        lesson.order === order && lesson.id !== excludeLessonId,
    );

    if (conflictingLesson) {
      throw new LessonOrderConflictError(order, chapterId);
    }
  }

  async getNextOrderInChapter(chapterId: string): Promise<number> {
    const lessons = await this.findByChapter(chapterId);
    if (lessons.length === 0) {
      return 0;
    }
    return Math.max(...lessons.map((l: Lesson) => l.order ?? 0)) + 1;
  }
}
