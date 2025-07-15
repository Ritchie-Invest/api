import {
  CreateGameModuleUseCase,
  CreateGameModuleCommand,
} from '../create-game-module.use-case';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { GameType } from '../../domain/type/GameType';
import { Lesson } from '../../domain/model/Lesson';
import { LessonNotFoundError } from '../../domain/error/LessonNotFoundError';
import { GameModuleTypeMismatchError } from '../../domain/error/GameModuleTypeMismatchError';
import { McqModuleStrategy } from '../strategies/mcq-module-strategy';
import { MapGameModuleStrategyFactory } from '../strategies/game-module-strategy-factory';
import { GameModuleStrategyNotFoundError } from '../../domain/error/GameModuleStrategyNotFoundError';
import { McqModule } from '../../domain/model/McqModule';
import { McqModuleInvalidDataError } from '../../domain/error/McqModuleInvalidDataError';

describe('CreateGameModuleUseCase', () => {
  let lessonRepository: InMemoryLessonRepository;
  let gameModuleRepository: InMemoryGameModuleRepository;
  let useCase: CreateGameModuleUseCase;

  beforeEach(() => {
    lessonRepository = new InMemoryLessonRepository();
    gameModuleRepository = new InMemoryGameModuleRepository();
    const mcqStrategy = new McqModuleStrategy();
    const strategyFactory = new MapGameModuleStrategyFactory([
      { type: GameType.MCQ, strategy: mcqStrategy },
    ]);
    useCase = new CreateGameModuleUseCase(
      lessonRepository,
      gameModuleRepository,
      strategyFactory,
    );
    gameModuleRepository.removeAll();
    lessonRepository.removeAll();
  });

  it('should create a MCQ module for a lesson', async () => {
    // Given
    const lesson = new Lesson(
      'lesson-1',
      'title',
      'desc',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [],
    );
    lessonRepository.create(lesson);
    const command: CreateGameModuleCommand = {
      lessonId: lesson.id,
      gameType: GameType.MCQ,
      mcq: {
        question: 'What is 2+2?',
        choices: [
          { text: '3', isCorrect: false, correctionMessage: 'No' },
          { text: '4', isCorrect: true, correctionMessage: 'Yes' },
        ],
      },
    };

    // When
    await useCase.execute(command);
    const modules = gameModuleRepository.findAll();

    // Then
    expect(modules.length).toBe(1);
    expect((modules[0] as McqModule).question).toBe('What is 2+2?');
  });

  it('should throw if lesson not found', async () => {
    const command: CreateGameModuleCommand = {
      lessonId: 'not-exist',
      gameType: GameType.MCQ,
      mcq: {
        question: 'Q?',
        choices: [
          { text: 'A', isCorrect: true, correctionMessage: 'ok' },
          { text: 'B', isCorrect: false, correctionMessage: 'no' },
        ],
      },
    };
    await expect(useCase.execute(command)).rejects.toThrow(LessonNotFoundError);
  });

  it('should throw if game type mismatch', async () => {
    // Given
    const lesson = new Lesson(
      'lesson-2',
      'title',
      'desc',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [],
    );
    lessonRepository.create(lesson);
    const command: CreateGameModuleCommand = {
      lessonId: lesson.id,
      gameType: 'OTHER' as GameType,
      mcq: {
        question: 'Q?',
        choices: [
          { text: 'A', isCorrect: true, correctionMessage: 'ok' },
          { text: 'B', isCorrect: false, correctionMessage: 'no' },
        ],
      },
    };

    // When / Then
    await expect(useCase.execute(command)).rejects.toThrow(
      GameModuleTypeMismatchError,
    );
  });

  it('should throw if no strategy for game type', async () => {
    // Given
    const lesson = new Lesson(
      'lesson-3',
      'title',
      'desc',
      'chapter-1',
      1,
      false,
      'OTHER' as GameType,
      [],
    );
    lessonRepository.create(lesson);
    const command: CreateGameModuleCommand = {
      lessonId: lesson.id,
      gameType: 'OTHER' as GameType,
    };

    // When / Then
    await expect(useCase.execute(command)).rejects.toThrow(
      GameModuleStrategyNotFoundError,
    );
  });

  it('should throw if MCQ data is missing', async () => {
    // Given
    const lesson = new Lesson(
      'lesson-4',
      'title',
      'desc',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [],
    );
    lessonRepository.create(lesson);
    const command: CreateGameModuleCommand = {
      lessonId: lesson.id,
      gameType: GameType.MCQ,
    };

    // When / Then
    await expect(useCase.execute(command)).rejects.toThrow(
      McqModuleInvalidDataError,
    );
  });
});
