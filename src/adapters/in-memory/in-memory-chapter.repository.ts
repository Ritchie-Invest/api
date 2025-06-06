import { Injectable } from '@nestjs/common';
import { ChapterRepository } from '../../core/domain/repository/chapter.repository';
import { Chapter } from '../../core/domain/model/Chapter';

@Injectable()
export class InMemoryChapterRepository implements ChapterRepository {
  private chapters: Map<string, Chapter> = new Map();

  create(data: Pick<Chapter, 'id' | 'title' | 'description'>): Chapter {
    const chapter = new Chapter(data.id, data.title, data.description);
    this.chapters.set(chapter.id, chapter);
    return chapter;
  }

  findById(id: string): Chapter | null {
    return this.chapters.get(id) || null;
  }

  findAll(): Chapter[] {
    return Array.from(this.chapters.values());
  }

  update(id: string, chapter: Chapter): Chapter | null {
    if (!this.chapters.has(id)) {
      return null;
    }
    this.chapters.set(id, chapter);
    return chapter;
  }

  remove(id: string): void {
    this.chapters.delete(id);
  }

  removeAll(): void {
    this.chapters.clear();
  }
}
