import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import {
  ChapterRepository,
  ChapterData,
  LessonData,
  ModuleData,
} from '../domain/repository/chapter.repository';
import { InvalidUserError } from '../domain/error/InvalidUserError';
import { Chapter } from '../domain/model/Chapter';
import { Lesson } from '../domain/model/Lesson';
import { GameType } from '../domain/type/GameType';

export type GetUserChaptersCommand = {
  userId: string;
};

export class LessonSummary extends Lesson {
  public readonly isUnlocked: boolean;
  public readonly completedModules: number;
  public readonly totalModules: number;

  constructor(
    lesson: Lesson,
    isUnlocked: boolean,
    completedModules: number,
    totalModules: number,
  ) {
    super(
      lesson.id,
      lesson.title,
      lesson.description,
      lesson.chapterId,
      lesson.order,
      lesson.isPublished,
      lesson.gameType,
      lesson.modules,
      lesson.updatedAt,
      lesson.createdAt,
    );
    this.isUnlocked = isUnlocked;
    this.completedModules = completedModules;
    this.totalModules = totalModules;
  }

  isCompleted(): boolean {
    return this.totalModules > 0 && this.completedModules === this.totalModules;
  }
}

export class ChapterSummary extends Chapter {
  public readonly isUnlocked: boolean;
  public readonly completedLessons: number;
  public readonly totalLessons: number;
  public readonly lessons: LessonSummary[];

  constructor(
    chapter: Chapter,
    isUnlocked: boolean,
    completedLessons: number,
    totalLessons: number,
    lessons: LessonSummary[],
  ) {
    super(
      chapter.id,
      chapter.title,
      chapter.description,
      chapter.order,
      chapter.isPublished,
      chapter.updatedAt,
      chapter.createdAt,
    );
    this.isUnlocked = isUnlocked;
    this.completedLessons = completedLessons;
    this.totalLessons = totalLessons;
    this.lessons = lessons;
  }

  isCompleted(): boolean {
    return this.totalLessons > 0 && this.completedLessons === this.totalLessons;
  }
}

export type GetUserChaptersResult = {
  chapters: ChapterSummary[];
};

@Injectable()
export class GetUserChaptersUseCase
  implements UseCase<GetUserChaptersCommand, GetUserChaptersResult>
{
  constructor(private readonly chapterRepository: ChapterRepository) {}

  /*
   * Point d'entrée principal du use case qui retourne tous les chapitres avec leurs leçons
   * pour un utilisateur, en calculant l'état de progression et de déverrouillage.
   */
  async execute(
    command: GetUserChaptersCommand,
  ): Promise<GetUserChaptersResult> {
    if (!command.userId) {
      throw new InvalidUserError('User ID is required');
    }

    const chaptersData = await this.chapterRepository.findAllWithLessonsDetails(
      command.userId,
    );

    const chaptersWithDetails: ChapterSummary[] = [];

    for (let i = 0; i < chaptersData.length; i++) {
      const chapterData = chaptersData[i];
      if (!chapterData) continue;

      const isChapterUnlocked = this.isChapterUnlocked(i, chaptersData);

      const processedLessons = this.processLessons(
        chapterData.lessons,
        i,
        chaptersData,
      );

      const chapter = new Chapter(
        chapterData.id,
        chapterData.title,
        chapterData.description,
        chapterData.order,
      );

      const chapterSummary = new ChapterSummary(
        chapter,
        isChapterUnlocked,
        processedLessons.completedLessonsCount,
        chapterData.lessons.length,
        processedLessons.lessonSummaries,
      );

      chaptersWithDetails.push(chapterSummary);
    }

    return {
      chapters: chaptersWithDetails,
    };
  }

  /*
   * Traite toutes les leçons d'un chapitre pour calculer leur état
   * et retourne à la fois les résumés de leçons et le nombre de leçons complétées.
   */
  private processLessons(
    lessons: LessonData[],
    chapterIndex: number,
    chaptersData: ChapterData[],
  ): { lessonSummaries: LessonSummary[]; completedLessonsCount: number } {
    const lessonSummaries: LessonSummary[] = [];
    let completedLessonsCount = 0;

    for (let j = 0; j < lessons.length; j++) {
      const lessonData = lessons[j];
      if (!lessonData) continue;

      const { completedModules, totalModules } = this.calculateModulesProgress(
        lessonData.modules,
      );
      const isLessonCompleted = this.isLessonCompleted(
        completedModules,
        totalModules,
      );

      if (isLessonCompleted) {
        completedLessonsCount++;
      }

      const isLessonUnlocked = this.isLessonUnlocked(
        j,
        chapterIndex,
        chaptersData,
        lessons,
      );

      const lesson = new Lesson(
        lessonData.id,
        lessonData.title,
        lessonData.description,
        '', // chapterId - nous pourrions l'obtenir du contexte si nécessaire
        lessonData.order,
        false, // isPublished
        GameType.MCQ, // gameType par défaut
      );

      const lessonSummary = new LessonSummary(
        lesson,
        isLessonUnlocked,
        completedModules,
        totalModules,
      );

      lessonSummaries.push(lessonSummary);
    }

    return { lessonSummaries, completedLessonsCount };
  }

  /*
   * Calcule la progression des modules en comptant le nombre total et le nombre
   * de modules complétés pour une leçon donnée.
   */
  private calculateModulesProgress(modules: ModuleData[]): {
    completedModules: number;
    totalModules: number;
  } {
    const completedModules = modules.filter((module) =>
      module.Progression.some((prog) => prog.isCompleted),
    ).length;

    const totalModules = modules.length;

    return { completedModules, totalModules };
  }

  /*
   * Détermine si une leçon est considérée comme complétée en vérifiant
   * si tous les modules sont terminés et s'il y a au moins un module.
   */
  private isLessonCompleted(
    completedModules: number,
    totalModules: number,
  ): boolean {
    return totalModules > 0 && completedModules === totalModules;
  }

  /*
   * Vérifie si une leçon est déverrouillée selon les règles suivantes:
   * - La première leçon d'un chapitre est déverrouillée si c'est le premier chapitre ou si le chapitre précédent est complété
   * - Les autres leçons sont déverrouillées si la leçon précédente dans le même chapitre est complétée
   */
  private isLessonUnlocked(
    lessonIndex: number,
    chapterIndex: number,
    chaptersData: ChapterData[],
    lessons: LessonData[],
  ): boolean {
    if (lessonIndex === 0) {
      const previousChapter = chaptersData[chapterIndex - 1];
      return (
        chapterIndex === 0 ||
        (previousChapter ? this.isChapterCompleted(previousChapter) : false)
      );
    } else {
      const previousLessonData = lessons[lessonIndex - 1];
      if (!previousLessonData) return false;

      const { completedModules, totalModules } = this.calculateModulesProgress(
        previousLessonData.modules,
      );
      return this.isLessonCompleted(completedModules, totalModules);
    }
  }

  /*
   * Détermine si un chapitre est déverrouillé:
   * - Le premier chapitre est toujours déverrouillé
   * - Les chapitres suivants sont déverrouillés si le chapitre précédent est complété
   */
  private isChapterUnlocked(
    chapterIndex: number,
    chaptersData: ChapterData[],
  ): boolean {
    const previousChapter = chaptersData[chapterIndex - 1];
    return (
      chapterIndex === 0 ||
      (previousChapter ? this.isChapterCompleted(previousChapter) : false)
    );
  }

  /*
   * Vérifie si un chapitre est complété en s'assurant que toutes ses leçons sont complétées.
   * Un chapitre est complété seulement si toutes ses leçons ont tous leurs modules complétés.
   */
  private isChapterCompleted(chapterData: ChapterData): boolean {
    if (!chapterData?.lessons || chapterData.lessons.length === 0) {
      return false;
    }

    return chapterData.lessons.every((lessonData) => {
      if (!lessonData?.modules || lessonData.modules.length === 0) {
        return false;
      }

      const completedModules = lessonData.modules.filter((module) =>
        module.Progression.some((prog) => prog.isCompleted),
      ).length;

      return completedModules === lessonData.modules.length;
    });
  }
}
