import { Injectable } from '@nestjs/common';
import { LessonRepository } from '../../core/domain/repository/lesson.repository';
import { Lesson } from '../../core/domain/model/Lesson';

@Injectable()
export class InMemoryLessonRepository implements LessonRepository {
  private lessons: Map<string, Lesson> = new Map();

  create(
    data: Pick<
      Lesson,
      'id' | 'title' | 'description' | 'chapterId' | 'order' | 'gameType'
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
