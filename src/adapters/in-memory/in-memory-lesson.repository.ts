import { Injectable } from '@nestjs/common';
import { LessonRepository } from '../../core/domain/repository/lesson.repository';
import { Lesson } from '../../core/domain/model/Lesson';
import { LessonOrderConflictError } from '../../core/domain/error/LessonOrderConflictError';

@Injectable()
export class InMemoryLessonRepository implements LessonRepository {
  private lessons: Map<string, Lesson> = new Map();

  constructor() {}

  validateUniqueOrderInChapter(
    chapterId: string,
    order: number,
    excludeLessonId?: string,
  ): Promise<void> {
    const existingLessons = this.findByChapter(chapterId);
    const conflictingLesson = existingLessons.find(
      (lesson: Lesson) =>
        lesson.order === order && lesson.id !== excludeLessonId,
    );

    if (conflictingLesson) {
      throw new LessonOrderConflictError(order, chapterId);
    }
    return Promise.resolve();
  }

  getNextOrderInChapter(chapterId: string): Promise<number> {
    const lessons = this.findByChapter(chapterId);
    if (lessons.length === 0) {
      return Promise.resolve(0);
    }
    return Promise.resolve(
      Math.max(...lessons.map((l: Lesson) => l.order ?? 0)) + 1,
    );
  }

  create(
    data: Pick<
      Lesson,
      | 'id'
      | 'title'
      | 'description'
      | 'chapterId'
      | 'order'
      | 'gameType'
      | 'modules'
    >,
  ): Lesson {
    const lesson = new Lesson(
      data.id,
      data.title,
      data.description,
      data.chapterId,
      data.order,
      false,
      data.gameType,
      data.modules || [],
    );
    this.lessons.set(lesson.id, lesson);
    return lesson;
  }

  findById(id: string): Lesson | null {
    return this.lessons.get(id) || null;
  }

  findAll(): Lesson[] {
    return Array.from(this.lessons.values());
  }

  findByChapter(chapterId: string): Lesson[] {
    return Array.from(this.lessons.values()).filter(
      (lesson) => lesson.chapterId === chapterId,
    );
  }

  update(id: string, lesson: Lesson): Lesson | null {
    if (!this.lessons.has(id)) {
      return null;
    }
    this.lessons.set(id, lesson);
    return lesson;
  }

  remove(id: string): void {
    this.lessons.delete(id);
  }

  removeAll(): void {
    this.lessons.clear();
  }
}
