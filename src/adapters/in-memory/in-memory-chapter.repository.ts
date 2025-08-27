import { Injectable } from '@nestjs/common';
import { ChapterRepository } from '../../core/domain/repository/chapter.repository';
import { Chapter } from '../../core/domain/model/Chapter';
import { LessonRepository } from '../../core/domain/repository/lesson.repository';
import { GameModuleRepository } from '../../core/domain/repository/game-module.repository';
import { ChapterOrderConflictError } from '../../core/domain/error/ChapterOrderConflictError';
import { ChapterWithLessons } from '../../core/domain/model/ChapterWithLessons';
import { LessonCompletionRepository } from '../../core/domain/repository/lesson-completion.repository';
import { LessonWithFirstGameModule } from '../../core/domain/model/LessonWithFirstGameModule';

@Injectable()
export class InMemoryChapterRepository implements ChapterRepository {
  private chapters: Map<string, Chapter> = new Map();

  constructor(
    private readonly lessonsRepository: LessonRepository,
    private readonly gameModuleRepository: GameModuleRepository,
    private readonly lessonCompletionRepository: LessonCompletionRepository,
  ) {}

  validateUniqueOrder(order: number, excludeChapterId?: string): Promise<void> {
    const existingChapters = this.findAll();
    const conflictingChapter = existingChapters.find(
      (chapter: Chapter) =>
        chapter.order === order && chapter.id !== excludeChapterId,
    );

    if (conflictingChapter) {
      throw new ChapterOrderConflictError(order);
    }
    return Promise.resolve();
  }

  getNextOrder(): Promise<number> {
    const chapters = this.findAll();
    if (chapters.length === 0) {
      return Promise.resolve(0);
    }
    return Promise.resolve(
      Math.max(...chapters.map((c: Chapter) => c.order)) + 1,
    );
  }

  create(
    data: Pick<Chapter, 'id' | 'title' | 'description' | 'order'>,
  ): Chapter {
    const chapter = new Chapter(
      data.id,
      data.title,
      data.description,
      data.order,
    );
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

  async findAllWithDetails(userId: string): Promise<ChapterWithLessons[]> {
    const chapters = Array.from(this.chapters.values())
      .filter((c) => c.isPublished)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return Promise.all(
      chapters.map(async (chapter) => {
        const lessons = (await this.lessonsRepository.findByChapter(chapter.id))
          .filter((l) => l.isPublished)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const lessonSummaries: LessonWithFirstGameModule[] = [];
        for (const lesson of lessons) {
          const modules = await this.gameModuleRepository.findByLessonId(
            lesson.id,
          );
          const firstModule = modules[0];
          const completion =
            this.lessonCompletionRepository.findByUserIdAndLessonId(
              userId,
              lesson.id,
            );
          lessonSummaries.push(
            new LessonWithFirstGameModule({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              order: lesson.order || 0,
              isCompleted: !!completion,
              gameModuleId: firstModule ? firstModule.id : null,
            }),
          );
        }

        return new ChapterWithLessons({
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          order: chapter.order || 0,
          lessons: lessonSummaries,
        });
      }),
    );
  }
}
