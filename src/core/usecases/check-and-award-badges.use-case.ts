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

export type AwardedBadge = {
  type: BadgeType;
};

@Injectable()
export class CheckAndAwardBadgesUseCase
  implements UseCase<CheckAndAwardBadgesCommand, AwardedBadge[]>
{
  constructor(
    private readonly userBadgeRepository: UserBadgeRepository,
    private readonly lessonCompletionRepository: LessonCompletionRepository,
    private readonly lessonRepository: LessonRepository,
  ) {}

  async execute(command: CheckAndAwardBadgesCommand): Promise<AwardedBadge[]> {
    const { userId, lessonId, completedModules, totalModules } = command;

    const newlyAwarded: AwardedBadge[] = [];

    if (totalModules > 0 && completedModules === totalModules) {
      if (
        !(await this.userBadgeRepository.hasBadge(
          userId,
          BadgeType.LEARN_PERFECT_QUIZ,
        ))
      ) {
        const b = await this.userBadgeRepository.award(
          userId,
          BadgeType.LEARN_PERFECT_QUIZ,
        );
        newlyAwarded.push({ type: b.type });
      }
    }

    const completions =
      await this.lessonCompletionRepository.findAllByUser(userId);
    const totalLessonsCompleted = completions.length;

    if (totalLessonsCompleted >= 5) {
      if (
        !(await this.userBadgeRepository.hasBadge(
          userId,
          BadgeType.PROG_5_LESSONS,
        ))
      ) {
        const b = await this.userBadgeRepository.award(
          userId,
          BadgeType.PROG_5_LESSONS,
        );
        newlyAwarded.push({ type: b.type });
      }
    }

    const lesson = await this.lessonRepository.findById(lessonId);
    if (lesson) {
      const chapterLessons = await this.lessonRepository.findByChapter(
        lesson.chapterId,
      );
      const completedLessonIds = new Set(completions.map((c) => c.lessonId));
      const chapterDone =
        chapterLessons.length > 0 &&
        chapterLessons.every((l) => completedLessonIds.has(l.id));
      if (chapterDone) {
        if (
          !(await this.userBadgeRepository.hasBadge(
            userId,
            BadgeType.PROG_FIRST_CHAPTER,
          ))
        ) {
          const b = await this.userBadgeRepository.award(
            userId,
            BadgeType.PROG_FIRST_CHAPTER,
          );
          newlyAwarded.push({ type: b.type });
        }
      }
    }

    const allLessons = await this.lessonRepository.findAll();
    if (
      allLessons.length > 0 &&
      totalLessonsCompleted / allLessons.length >= 0.5
    ) {
      if (
        !(await this.userBadgeRepository.hasBadge(
          userId,
          BadgeType.PROG_50_PERCENT,
        ))
      ) {
        const b = await this.userBadgeRepository.award(
          userId,
          BadgeType.PROG_50_PERCENT,
        );
        newlyAwarded.push({ type: b.type });
      }
    }

    return newlyAwarded;
  }
}
