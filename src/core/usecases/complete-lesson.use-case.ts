import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { LessonCompletionRepository } from '../domain/repository/lesson-completion.repository';
import { LessonAttemptRepository } from '../domain/repository/lesson-attempt.repository';
import { ModuleAttemptRepository } from '../domain/repository/module-attempt.repository';
import { LessonNotFoundError } from '../domain/error/LessonNotFoundError';
import { LessonNotFullyAttemptedError } from '../domain/error/LessonNotFullyAttemptedError';
import { LessonAlreadyCompletedError } from '../domain/error/LessonAlreadyCompletedError';
import { LessonCompletion } from '../domain/model/LessonCompletion';
import { LessonAttemptNotFoundError } from '../domain/error/LessonAttemptNotFoundError';
import { LessonAttemptAlreadyFinishedError } from '../domain/error/LessonAttemptAlreadyFinishedError';

export type CompleteLessonCommand = {
  userId: string;
  lessonId: string;
};

export type CompleteLessonResult = {
  completedGameModules: number;
  totalGameModules: number;
  isCompleted: boolean;
};

@Injectable()
export class CompleteLessonUseCase
  implements UseCase<CompleteLessonCommand, CompleteLessonResult>
{
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly lessonCompletionRepository: LessonCompletionRepository,
    private readonly lessonAttemptRepository: LessonAttemptRepository,
    private readonly moduleAttemptRepository: ModuleAttemptRepository,
  ) {}

  async execute(command: CompleteLessonCommand): Promise<CompleteLessonResult> {
    const lesson = await this.lessonRepository.findById(command.lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(command.lessonId);
    }

    const existingCompletion =
      await this.lessonCompletionRepository.findByUserIdAndLessonId(
        command.userId,
        command.lessonId,
      );
    if (existingCompletion) {
      throw new LessonAlreadyCompletedError(command.lessonId);
    }

    const lessonAttempt =
      await this.lessonAttemptRepository.findLastByUserIdAndLessonId(
        command.userId,
        command.lessonId,
      );
    if (!lessonAttempt) {
      throw new LessonAttemptNotFoundError(command.userId, command.lessonId);
    }
    if (lessonAttempt.finishedAt) {
      throw new LessonAttemptAlreadyFinishedError(lessonAttempt.id);
    }

    const lastAttemptsByModule = await Promise.all(
      lesson.modules.map(async (module) => {
        return this.moduleAttemptRepository.findByLessonAttemptIdAndModuleId(
          lessonAttempt.id,
          module.id,
        );
      }),
    );
    const totalModules = lesson.modules.length;
    const attemptedModules = lastAttemptsByModule.filter((a) => !!a).length;
    if (attemptedModules < totalModules) {
      throw new LessonNotFullyAttemptedError(
        command.lessonId,
        attemptedModules,
        totalModules,
      );
    }
    const completedModules = lastAttemptsByModule.filter(
      (a) => a && a.isCorrect,
    ).length;
    const score =
      totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    let isCompleted = false;
    if (score >= 80) {
      isCompleted = true;
      const lessonCompletion = new LessonCompletion(
        crypto.randomUUID(),
        command.userId,
        command.lessonId,
        completedModules,
        new Date(),
      );
      await this.lessonCompletionRepository.create(lessonCompletion);
      await this.lessonAttemptRepository.finishAttempt(
        lessonAttempt.id,
        new Date(),
      );
    }

    return {
      completedGameModules: completedModules,
      totalGameModules: totalModules,
      isCompleted,
    };
  }
}
