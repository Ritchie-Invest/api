import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import {
  ChapterRepository,
  ChapterData,
  LessonData,
  ModuleData,
} from '../domain/repository/chapter.repository';
import { InvalidUserError } from '../domain/error/InvalidUserError';

export type GetUserChaptersCommand = {
  userId: string;
};

export type LessonSummary = {
  id: string;
  title: string;
  description: string;
  order: number;
  is_unlocked: boolean;
  completed_modules: number;
  total_modules: number;
};

export type ChapterSummary = {
  id: string;
  title: string;
  description: string;
  order: number;
  is_unlocked: boolean;
  completed_lessons: number;
  total_lessons: number;
  lessons: LessonSummary[];
};

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

      chaptersWithDetails.push({
        id: chapterData.id,
        title: chapterData.title,
        description: chapterData.description,
        order: chapterData.order,
        is_unlocked: isChapterUnlocked,
        completed_lessons: processedLessons.completedLessonsCount,
        total_lessons: chapterData.lessons.length,
        lessons: processedLessons.lessonSummaries,
      });
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

      lessonSummaries.push({
        id: lessonData.id,
        title: lessonData.title,
        description: lessonData.description,
        order: lessonData.order,
        is_unlocked: isLessonUnlocked,
        completed_modules: completedModules,
        total_modules: totalModules,
      });
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
