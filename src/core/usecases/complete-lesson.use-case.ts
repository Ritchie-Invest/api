import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { ProgressionRepository } from '../domain/repository/progression.repository';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { LessonNotFoundError } from '../domain/error/LessonNotFoundError';

export type CompleteLessonCommand = {
  userId: string;
  lessonId: string;
};

export type CompleteLessonResult = {
  score: number;
  totalGameModules: number;
};

@Injectable()
export class CompleteLessonUseCase
  implements UseCase<CompleteLessonCommand, CompleteLessonResult>
{
  constructor(
    private readonly progressionRepository: ProgressionRepository,
    private readonly lessonRepository: LessonRepository,
  ) {}

  async execute(command: CompleteLessonCommand): Promise<CompleteLessonResult> {
    const lesson = await this.lessonRepository.findById(command.lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(command.lessonId);
    }

    const progressions =
      await this.progressionRepository.findByUserIdAndLessonId(
        command.userId,
        command.lessonId,
      );

    return {
      score: progressions.filter((progression) => progression.isCompleted)
        .length,
      totalGameModules: lesson.modules.length,
    };
  }
}
