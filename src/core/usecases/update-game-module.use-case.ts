import { UseCase } from '../base/use-case';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { Lesson } from '../domain/model/Lesson';
import { GameModuleStrategyFactory } from './strategies/game-module-strategy-factory';
import { LessonNotFoundError } from '../domain/error/LessonNotFoundError';
import { GameModuleRepository } from '../domain/repository/game-module.repository';
import { GameModuleNotFoundError } from '../domain/error/GameModuleNotFoundError';

export type UpdateGameModuleCommand = {
  gameModuleId: string;
  mcq?: {
    question: string;
    choices: { text: string; isCorrect: boolean; correctionMessage: string }[];
  };
};

export class UpdateGameModuleUseCase
  implements UseCase<UpdateGameModuleCommand, Lesson>
{
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly gameModuleRepository: GameModuleRepository,
    private readonly strategyFactory: GameModuleStrategyFactory,
  ) {}

  async execute(command: UpdateGameModuleCommand): Promise<Lesson> {
    const gameModule = await this.gameModuleRepository.findById(
      command.gameModuleId,
    );
    if (!gameModule) {
      throw new GameModuleNotFoundError(command.gameModuleId);
    }
    const lesson = await this.lessonRepository.findById(gameModule.lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(gameModule.lessonId);
    }

    const strategy = this.strategyFactory.getStrategy(lesson.gameType);
    const module = strategy.updateModule(gameModule, command);
    await this.gameModuleRepository.update(gameModule.id, module);

    const updatedLesson = await this.lessonRepository.findById(lesson.id);
    if (!updatedLesson) {
      throw new LessonNotFoundError(lesson.id);
    }
    return updatedLesson;
  }
}
