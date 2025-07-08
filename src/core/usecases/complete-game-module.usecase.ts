import { Injectable } from '@nestjs/common';
import { UseCase } from '../base/use-case';
import { GameModule } from '../domain/model/GameModule';
import { GameModuleRepository } from '../domain/repository/game-module.repository';
import { ProgressionRepository } from '../domain/repository/progression.repository';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { Progression } from '../domain/model/Progression';
import { GameModuleNotFoundError } from '../domain/error/GameModuleNotFoundError';
import { GameType } from '../domain/type/GameType';
import { CompleteGameModuleStrategyFactory } from './strategies/complete-game-module-strategy-factory';
import { LessonNotFoundError } from '../domain/error/LessonNotFoundError';

export type CompleteGameModuleCommand = {
  userId: string;
  moduleId: string;
  gameType: GameType;
  mcq?: {
    choiceId: string;
  };
};

export type CompleteGameModuleResult = {
  isCorrect: boolean;
  feedback: string;
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
    private readonly progressionRepository: ProgressionRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly strategyFactory: CompleteGameModuleStrategyFactory,
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

    const strategy = this.strategyFactory.getStrategy(command.gameType);
    const { isCorrect, feedback } = strategy.validate(gameModule, command);

    if (isCorrect) {
      await this.saveProgression(command.userId, command.moduleId, true);
    }

    const lesson = await this.lessonRepository.findById(gameModule.lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(gameModule.lessonId);
    }

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
      nextGameModuleId: nextModule?.id || null,
      currentGameModuleIndex: Math.max(0, currentIndex),
      totalGameModules: lesson.modules.length,
    };
  }

  private async saveProgression(
    userId: string,
    gameModuleId: string,
    isCompleted: boolean,
  ): Promise<void> {
    const existingProgression =
      await this.progressionRepository.findByUserIdAndGameModuleId(
        userId,
        gameModuleId,
      );

    if (existingProgression) {
      existingProgression.isCompleted = isCompleted;
      await this.progressionRepository.update(
        existingProgression.id,
        existingProgression,
      );
    } else {
      const progression = new Progression(
        crypto.randomUUID(),
        userId,
        gameModuleId,
        isCompleted,
      );
      await this.progressionRepository.create(progression);
    }
  }
}
