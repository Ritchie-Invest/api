import { UseCase } from '../base/use-case';
import { LessonRepository } from '../domain/repository/lesson.repository';
import { Lesson } from '../domain/model/Lesson';
import { GameType } from '../domain/type/GameType';
import { GameModuleStrategyFactory } from './strategies/game-module-strategy-factory';
import { LessonNotFoundError } from '../domain/error/LessonNotFoundError';
import { GameModuleTypeMismatchError } from '../domain/error/GameModuleTypeMismatchError';
import { GameModuleRepository } from '../domain/repository/game-module.repository';

export type CreateGameModuleCommand = {
  lessonId: string;
  gameType: GameType;
  mcq?: {
    question: string;
    choices: { text: string; isCorrect: boolean; correctionMessage: string }[];
  };
  fillInTheBlank?: {
    firstText: string;
    secondText: string;
    blanks: { text: string; isCorrect: boolean; correctionMessage: string }[];
  };
};

export class CreateGameModuleUseCase
  implements UseCase<CreateGameModuleCommand, Lesson>
{
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly gameModuleRepository: GameModuleRepository,
    private readonly strategyFactory: GameModuleStrategyFactory,
  ) {}

  async execute(command: CreateGameModuleCommand): Promise<Lesson> {
    const lesson = await this.lessonRepository.findById(command.lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(command.lessonId);
    }
    if (lesson.gameType !== command.gameType) {
      throw new GameModuleTypeMismatchError();
    }

    const strategy = this.strategyFactory.getStrategy(command.gameType);
    const module = strategy.createModule(command);
    await this.gameModuleRepository.create(module);

    const updatedLesson = await this.lessonRepository.findById(lesson.id);
    if (!updatedLesson) {
      throw new LessonNotFoundError(lesson.id);
    }
    return updatedLesson;
  }
}
