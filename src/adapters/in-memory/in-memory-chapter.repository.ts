import { Injectable } from '@nestjs/common';
import {
  ChapterRepository,
  ChapterData,
} from '../../core/domain/repository/chapter.repository';
import { Chapter } from '../../core/domain/model/Chapter';
import { LessonRepository } from '../../core/domain/repository/lesson.repository';
import { GameModuleRepository } from '../../core/domain/repository/game-module.repository';
import { ProgressionRepository } from '../../core/domain/repository/progression.repository';

@Injectable()
export class InMemoryChapterRepository implements ChapterRepository {
  private chapters: Map<string, Chapter> = new Map();

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

  constructor(
    private readonly lessonsRepository: LessonRepository,
    private readonly gameModuleRepository: GameModuleRepository,
    private readonly progressionRepository: ProgressionRepository,
  ) {}

  async findAllWithLessonsDetails(userId: string): Promise<ChapterData[]> {
    const chapters = Array.from(this.chapters.values()).sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );

    const result: ChapterData[] = [];

    for (const chapter of chapters) {
      const lessons = await this.lessonsRepository.findByChapter(chapter.id);

      const lessonsWithModules = [];
      for (const lesson of lessons) {
        const modules = await this.gameModuleRepository.findByLessonId(
          lesson.id,
        );

        const modulesWithProgress = [];
        for (const module of modules) {
          const progression =
            await this.progressionRepository.findByUserIdAndGameModuleId(
              userId,
              module.id,
            );
          const progressions = progression ? [progression] : [];

          modulesWithProgress.push({
            id: module.id,
            Progression: progressions,
          });
        }

        lessonsWithModules.push({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order || 0,
          modules: modulesWithProgress,
        });
      }

      result.push({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        order: chapter.order || 0,
        lessons: lessonsWithModules,
      });
    }

    return result;
  }
}
