import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { UserBadgeRepository } from '../domain/repository/user-badge.repository';
import { LessonCompletionRepository } from '../domain/repository/lesson-completion.repository';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { BadgeType } from '../domain/type/BadgeType';

export type CheckAndAwardBadgesCommand = {
  userId: string;
  lessonId: string;
  completedModules: number;
  totalModules: number;
};

@Injectable()
export class CheckAndAwardBadgesUseCase
  implements UseCase<CheckAndAwardBadgesCommand, void>
{
  constructor(
    private readonly userBadgeRepository: UserBadgeRepository,
    private readonly lessonCompletionRepository: LessonCompletionRepository,
    private readonly lessonRepository: LessonRepository,
  ) {}

  private isPerfectQuiz(completed: number, total: number): boolean {
    return total > 0 && completed === total;
  }

  private async shouldAward5Lessons(userId: string): Promise<boolean> {
    const completions =
      await this.lessonCompletionRepository.findAllByUser(userId);
    return completions.length >= 5;
  }

  private async isFirstChapterCompleted(
    userId: string,
    lessonId: string,
  ): Promise<boolean> {
    const [completions, lesson] = await Promise.all([
      this.lessonCompletionRepository.findAllByUser(userId),
      this.lessonRepository.findById(lessonId),
    ]);
    if (!lesson) return false;
    const [chapterLessons] = await Promise.all([
      this.lessonRepository.findByChapter(lesson.chapterId),
    ]);
    const completedLessonIds = new Set(completions.map((c) => c.lessonId));
    return (
      chapterLessons.length > 0 &&
      chapterLessons.every((l) => completedLessonIds.has(l.id))
    );
  }

  private async hasCompletedAtLeastHalf(userId: string): Promise<boolean> {
    const [completions, allLessons] = await Promise.all([
      this.lessonCompletionRepository.findAllByUser(userId),
      this.lessonRepository.findAll(),
    ]);
    return (
      allLessons.length > 0 && completions.length / allLessons.length >= 0.5
    );
  }

  async execute(command: CheckAndAwardBadgesCommand): Promise<void> {
    const { userId, lessonId, completedModules, totalModules } = command;

    if (this.isPerfectQuiz(completedModules, totalModules)) {
      if (
        !(await this.userBadgeRepository.hasBadge(
          userId,
          BadgeType.LEARN_PERFECT_QUIZ,
        ))
      ) {
        await this.userBadgeRepository.award(
          userId,
          BadgeType.LEARN_PERFECT_QUIZ,
        );
      }
    }

    if (await this.shouldAward5Lessons(userId)) {
      if (
        !(await this.userBadgeRepository.hasBadge(
          userId,
          BadgeType.PROG_5_LESSONS,
        ))
      ) {
        await this.userBadgeRepository.award(userId, BadgeType.PROG_5_LESSONS);
      }
    }

    if (await this.isFirstChapterCompleted(userId, lessonId)) {
      if (
        !(await this.userBadgeRepository.hasBadge(
          userId,
          BadgeType.PROG_FIRST_CHAPTER,
        ))
      ) {
        await this.userBadgeRepository.award(
          userId,
          BadgeType.PROG_FIRST_CHAPTER,
        );
      }
    }

    if (await this.hasCompletedAtLeastHalf(userId)) {
      if (
        !(await this.userBadgeRepository.hasBadge(
          userId,
          BadgeType.PROG_50_PERCENT,
        ))
      ) {
        await this.userBadgeRepository.award(userId, BadgeType.PROG_50_PERCENT);
      }
    }
  }
}
