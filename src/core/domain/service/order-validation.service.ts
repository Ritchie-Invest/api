import { Injectable } from '@nestjs/common';
import { ChapterRepository } from '../../domain/repository/chapter.repository';
import { LessonRepository } from '../../domain/repository/lesson.repository';
import { ChapterOrderConflictError } from '../../domain/error/ChapterOrderConflictError';
import { LessonOrderConflictError } from '../../domain/error/LessonOrderConflictError';
import { Chapter } from '../../domain/model/Chapter';
import { Lesson } from '../../domain/model/Lesson';

export abstract class OrderValidationInterface {
  abstract validateChapterOrder(
    chapterRepository: ChapterRepository,
    order: number,
    excludeChapterId?: string,
  ): Promise<void>;

  abstract validateLessonOrder(
    lessonRepository: LessonRepository,
    chapterId: string,
    order: number,
    excludeLessonId?: string,
  ): Promise<void>;

  abstract getNextChapterOrder(
    chapterRepository: ChapterRepository,
  ): Promise<number>;

  abstract getNextLessonOrder(
    lessonRepository: LessonRepository,
    chapterId: string,
  ): Promise<number>;
}

@Injectable()
export class OrderValidationService extends OrderValidationInterface {
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
      throw new ChapterOrderConflictError(order);
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
      throw new LessonOrderConflictError(order, chapterId);
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
