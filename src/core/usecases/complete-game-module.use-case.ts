import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { GameModule } from '../domain/model/GameModule';
import { GameModuleRepository } from '../domain/repository/game-module.repository';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { GameModuleNotFoundError } from '../domain/error/GameModuleNotFoundError';
import { GameType } from '../domain/type/GameType';
import { CompleteGameModuleStrategyFactory } from './strategies/complete-game-module-strategy-factory';
import { LessonNotFoundError } from '../domain/error/LessonNotFoundError';
import { LessonAttemptRepository } from '../domain/repository/lesson-attempt.repository';
import { ModuleAttemptRepository } from '../domain/repository/module-attempt.repository';
import { ModuleAttempt } from '../domain/model/ModuleAttempt';
import { LessonAttempt } from '../domain/model/LessonAttempt';
import { ModuleAlreadyAttemptedError } from '../domain/error/ModuleAlreadyAttemptedError';

export type CompleteGameModuleCommand = {
  userId: string;
  moduleId: string;
  gameType: GameType;
  mcq?: {
    choiceId: string;
  };
  fillInTheBlank?: {
    blankId: string;
  };
  trueOrFalse?: boolean;
};

export type CompleteGameModuleResult = {
  isCorrect: boolean;
  feedback: string;
  correctChoiceId: string;
  nextGameModuleId: string | null;
  currentGameModuleIndex: number;
  totalGameModules: number;
};

@Injectable()
export class CompleteGameModuleUseCase
  implements UseCase<CompleteGameModuleCommand, CompleteGameModuleResult>
{
  constructor(
    private readonly gameModuleRepository: GameModuleRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly strategyFactory: CompleteGameModuleStrategyFactory,
    private readonly lessonAttemptRepository: LessonAttemptRepository,
    private readonly moduleAttemptRepository: ModuleAttemptRepository,
  ) {}

  async execute(
    command: CompleteGameModuleCommand,
  ): Promise<CompleteGameModuleResult> {
    const gameModule = await this.gameModuleRepository.findById(
      command.moduleId,
    );
    if (!gameModule) {
      throw new GameModuleNotFoundError(command.moduleId);
    }

    const lesson = await this.lessonRepository.findById(gameModule.lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(gameModule.lessonId);
    }

    let lessonAttempt =
      await this.lessonAttemptRepository.findLastByUserIdAndLessonId(
        command.userId,
        lesson.id,
      );
    if (!lessonAttempt || lessonAttempt.finishedAt) {
      lessonAttempt = new LessonAttempt(
        crypto.randomUUID(),
        command.userId,
        lesson.id,
        new Date(),
      );
      await this.lessonAttemptRepository.create(lessonAttempt);
    }

    const alreadyAttempted =
      await this.moduleAttemptRepository.findByLessonAttemptIdAndModuleId(
        lessonAttempt.id,
        command.moduleId,
      );
    if (alreadyAttempted) {
      throw new ModuleAlreadyAttemptedError(command.moduleId, lessonAttempt.id);
    }

    const strategy = this.strategyFactory.getStrategy(command.gameType);
    const { isCorrect, feedback, correctChoiceId } = strategy.validate(
      gameModule,
      command,
    );

    const moduleAttempt = new ModuleAttempt(
      crypto.randomUUID(),
      command.userId,
      command.moduleId,
      lessonAttempt.id,
      isCorrect,
      new Date(),
    );
    await this.moduleAttemptRepository.create(moduleAttempt);

    const currentIndex = lesson.modules.findIndex(
      (module: GameModule) => module.id === command.moduleId,
    );
    const nextModule =
      currentIndex >= 0 && currentIndex < lesson.modules.length - 1
        ? lesson.modules[currentIndex + 1]
        : null;

    return {
      isCorrect,
      feedback,
      correctChoiceId,
      nextGameModuleId: nextModule?.id || null,
      currentGameModuleIndex: Math.max(0, currentIndex),
      totalGameModules: lesson.modules.length,
    };
  }
}
