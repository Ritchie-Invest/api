import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { ChapterRepository } from '../domain/repository/chapter.repository';
import { InvalidUserError } from '../domain/error/InvalidUserError';
import { ChapterWithLessons } from '../domain/model/ChapterWithLessons';
import { LessonWithFirstGameModule } from '../domain/model/LessonWithFirstGameModule';
import { ChapterStatus } from '../domain/type/ChapterStatus';
import { LessonStatus } from '../domain/type/LessonStatus';

export type GetUserProgressCommand = {
  userId: string;
};

export type LessonSummary = {
  id: string;
  title: string;
  description: string;
  order: number;
  status: LessonStatus;
  gameModuleId: string | null;
};

export type ChapterSummary = {
  id: string;
  title: string;
  description: string;
  order: number;
  status: ChapterStatus;
  completedLessons: number;
  totalLessons: number;
  lessons: LessonSummary[];
};

export type GetUserProgressResult = ChapterSummary[];

@Injectable()
export class GetUserProgressUseCase
  implements UseCase<GetUserProgressCommand, GetUserProgressResult>
{
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async execute(
    command: GetUserProgressCommand,
  ): Promise<GetUserProgressResult> {
    if (!command.userId) {
      throw new InvalidUserError('User ID is required');
    }

    const chaptersWithLessons = await this.chapterRepository.findAllWithDetails(
      command.userId,
    );

    const chaptersSummaries: ChapterSummary[] = [];

    for (let i = 0; i < chaptersWithLessons.length; i++) {
      const chapterWithLessons = chaptersWithLessons[i];
      if (!chapterWithLessons) continue;

      const isChapterUnlocked = this.isChapterUnlocked(i, chaptersWithLessons);

      const processedLessons = this.processLessons(
        chapterWithLessons.lessons,
        isChapterUnlocked,
      );
      chaptersSummaries.push({
        id: chapterWithLessons.id,
        title: chapterWithLessons.title,
        description: chapterWithLessons.description,
        order: chapterWithLessons.order,
        status: this.getChapterStatus(chapterWithLessons, isChapterUnlocked),
        completedLessons: processedLessons.filter(
          (lesson) => lesson.status === LessonStatus.COMPLETED,
        ).length,
        totalLessons: chapterWithLessons.lessons.length,
        lessons: processedLessons,
      });
    }

    return chaptersSummaries;
  }

  private processLessons(
    lessons: LessonWithFirstGameModule[],
    isChapterUnlocked: boolean,
  ) {
    const lessonSummaries: LessonSummary[] = [];

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      if (!lesson) {
        continue;
      }

      const isLessonUnlocked = this.isLessonUnlocked(
        lessons,
        i,
        isChapterUnlocked,
      );

      lessonSummaries.push({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        status: this.getLessonStatus(isLessonUnlocked, lesson.isCompleted),
        gameModuleId: lesson.gameModuleId,
      });
    }

    return lessonSummaries;
  }

  private isLessonUnlocked(
    lessons: LessonWithFirstGameModule[],
    lessonIndex: number,
    isChapterUnlocked: boolean,
  ): boolean {
    const previousLesson = lessons[lessonIndex - 1];
    return (
      (lessonIndex === 0 || previousLesson?.isCompleted || false) &&
      isChapterUnlocked
    );
  }

  private isChapterUnlocked(
    chapterIndex: number,
    chaptersWithLessons: ChapterWithLessons[],
  ): boolean {
    const previousChapter = chaptersWithLessons[chapterIndex - 1];
    return chapterIndex === 0 || previousChapter?.isCompleted() || false;
  }

  private getLessonStatus(
    isLessonUnlocked: boolean,
    isLessonCompleted: boolean,
  ): LessonStatus {
    if (isLessonCompleted) {
      return LessonStatus.COMPLETED;
    }
    return isLessonUnlocked ? LessonStatus.UNLOCKED : LessonStatus.LOCKED;
  }

  private getChapterStatus(
    chapter: ChapterWithLessons,
    isChapterUnlocked: boolean,
  ): ChapterStatus {
    if (chapter.isCompleted()) {
      return ChapterStatus.COMPLETED;
    }
    if (chapter.isInProgress()) {
      return ChapterStatus.IN_PROGRESS;
    }
    return isChapterUnlocked ? ChapterStatus.UNLOCKED : ChapterStatus.LOCKED;
  }
}
