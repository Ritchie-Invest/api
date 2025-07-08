import { OrderValidationInterface } from '../../core/domain/service/order-validation.service';
import { ChapterRepository } from '../../core/domain/repository/chapter.repository';
import { LessonRepository } from '../../core/domain/repository/lesson.repository';
import { OrderConflictError } from '../../core/domain/error/OrderConflictError';
import { Chapter } from '../../core/domain/model/Chapter';
import { Lesson } from '../../core/domain/model/Lesson';

export class InMemoryOrderValidationService
  implements OrderValidationInterface
{
  async validateChapterOrder(
    chapterRepository: ChapterRepository,
    order: number,
    excludeChapterId?: string,
  ): Promise<void> {
    const existingChapters = await chapterRepository.findAll();

    const conflictingChapter = existingChapters.find(
      (chapter: Chapter) =>
        chapter.order === order && chapter.id !== excludeChapterId,
    );

    if (conflictingChapter) {
      throw new OrderConflictError(
        `A chapter with order ${order} already exists`,
      );
    }
  }

  async validateLessonOrder(
    lessonRepository: LessonRepository,
    chapterId: string,
    order: number,
    excludeLessonId?: string,
  ): Promise<void> {
    const existingLessons = await lessonRepository.findByChapter(chapterId);

    const conflictingLesson = existingLessons.find(
      (lesson: Lesson) =>
        lesson.order === order && lesson.id !== excludeLessonId,
    );

    if (conflictingLesson) {
      throw new OrderConflictError(
        `A lesson with order ${order} already exists in chapter ${chapterId}`,
      );
    }
  }

  async getNextChapterOrder(
    chapterRepository: ChapterRepository,
  ): Promise<number> {
    const chapters = await chapterRepository.findAll();
    if (chapters.length === 0) {
      return 0;
    }
    return Math.max(...chapters.map((c: Chapter) => c.order)) + 1;
  }

  async getNextLessonOrder(
    lessonRepository: LessonRepository,
    chapterId: string,
  ): Promise<number> {
    const lessons = await lessonRepository.findByChapter(chapterId);
    if (lessons.length === 0) {
      return 0;
    }
    return Math.max(...lessons.map((l: Lesson) => l.order ?? 0)) + 1;
  }
}
