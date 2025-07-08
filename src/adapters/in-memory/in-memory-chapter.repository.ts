import { Injectable } from '@nestjs/common';
import { ChapterRepository } from '../../core/domain/repository/chapter.repository';
import { Chapter } from '../../core/domain/model/Chapter';

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

  // Pour les tests, nous devons stocker les leçons et les modules manuellement
  private lessonsRepository: any = null;
  private gameModuleRepository: any = null;
  private progressionRepository: any = null;

  setDependencies(
    lessonsRepository: any,
    gameModuleRepository: any,
    progressionRepository: any,
  ): void {
    this.lessonsRepository = lessonsRepository;
    this.gameModuleRepository = gameModuleRepository;
    this.progressionRepository = progressionRepository;
  }

  async findAllWithLessonsDetails(userId: string): Promise<any[]> {
    const chapters = Array.from(this.chapters.values()).sort(
      (a, b) => a.order - b.order,
    );

    if (
      !this.lessonsRepository ||
      !this.gameModuleRepository ||
      !this.progressionRepository
    ) {
      return chapters.map((chapter) => ({
        ...chapter,
        lessons: [],
      }));
    }

    const result = [];

    for (const chapter of chapters) {
      const lessons = await this.lessonsRepository.findByChapter(chapter.id);

      const lessonsWithModules = [];
      for (const lesson of lessons) {
        const modules = await this.gameModuleRepository.findByLessonId(
          lesson.id,
        );

        const modulesWithProgress = [];
        for (const module of modules) {
          const progressions =
            await this.progressionRepository.findByGameModuleId(module.id);
          const filteredProgressions = progressions.filter(
            (prog: any) => prog.userId === userId,
          );

          modulesWithProgress.push({
            ...module,
            Progression: filteredProgressions,
          });
        }

        lessonsWithModules.push({
          ...lesson,
          modules: modulesWithProgress,
        });
      }

      result.push({
        ...chapter,
        lessons: lessonsWithModules,
      });
    }

    return result;
  }
}
