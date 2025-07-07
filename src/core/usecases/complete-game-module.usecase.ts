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

export type CompleteGameModuleCommand = {
  userId: string;
  moduleId: string;
  gameType: GameType;
  mcq?: {
    choiceId: string;
  };
  // Future game types can add their answer data here
  // dragDrop?: { positions: Array<{ itemId: string; position: { x: number; y: number } }> };
  // quiz?: { answers: string[] };
};

export type CompleteGameModuleResult = {
  correctAnswer: boolean;
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
    if (!command.userId) {
      throw new Error('User ID is required');
    }
    if (!command.moduleId) {
      throw new Error('Module ID is required');
    }

    const gameModule = await this.gameModuleRepository.findById(
      command.moduleId,
    );
    if (!gameModule) {
      throw new GameModuleNotFoundError(command.moduleId);
    }

    // Use strategy pattern to handle different game types
    const strategy = this.strategyFactory.getStrategy(command.gameType);
    const strategyResult = strategy.validateMcq(gameModule, command);

    // Only create progression if answer is correct
    if (strategyResult.correctAnswer) {
      await this.saveProgression(command.userId, command.moduleId, true);
    }

    // Get lesson information to calculate progression
    const lesson = await this.lessonRepository.findById(gameModule.lessonId);
    const allModulesInLesson = lesson
      ? await this.gameModuleRepository.findByLessonId(gameModule.lessonId)
      : [];

    // Find current module index and next module
    const currentIndex = allModulesInLesson.findIndex(
      (module: GameModule) => module.id === command.moduleId,
    );
    const nextModule =
      currentIndex >= 0 && currentIndex < allModulesInLesson.length - 1
        ? allModulesInLesson[currentIndex + 1]
        : null;

    return {
      correctAnswer: strategyResult.correctAnswer,
      feedback: strategyResult.feedback,
      nextGameModuleId: nextModule?.id || null,
      currentGameModuleIndex: Math.max(0, currentIndex),
      totalGameModules: allModulesInLesson.length,
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
      existingProgression.updatedAt = new Date();
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
