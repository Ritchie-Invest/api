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
import { TrueOrFalseModule } from '../../domain/model/TrueOrFalseModule';
import { McqModuleInvalidDataError } from '../../domain/error/McqModuleInvalidDataError';
import { TrueOrFalseModuleInvalidDataError } from '../../domain/error/TrueOrFalseModuleInvalidDataError';
import { FillInTheBlankModuleStrategy } from '../strategies/fill-in-the-blanks-module-strategy';
import { FillInTheBlankModule } from '../../domain/model/FillInTheBlankModule';
import { FillInTheBlankModuleInvalidDataError } from '../../domain/error/FillInTheBlankModuleInvalidDataError';
import { TrueOrFalseModuleStrategy } from '../strategies/true-or-false-module-strategy';

describe('CreateGameModuleUseCase', () => {
  let lessonRepository: InMemoryLessonRepository;
  let gameModuleRepository: InMemoryGameModuleRepository;
  let useCase: CreateGameModuleUseCase;

  beforeEach(() => {
    lessonRepository = new InMemoryLessonRepository();
    gameModuleRepository = new InMemoryGameModuleRepository();
    const mcqStrategy = new McqModuleStrategy();
    const fillInTheBlankStrategy = new FillInTheBlankModuleStrategy();
    const trueOrFalseStrategy = new TrueOrFalseModuleStrategy();
    const strategyFactory = new MapGameModuleStrategyFactory([
      { type: GameType.MCQ, strategy: mcqStrategy },
      { type: GameType.FILL_IN_THE_BLANK, strategy: fillInTheBlankStrategy },
      { type: GameType.TRUE_OR_FALSE, strategy: trueOrFalseStrategy },
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
    const mcqModule = modules[0] as McqModule;
    expect(mcqModule.question).toBe('What is 2+2?');
  });

  it('should create a Fill in the Blank module for a lesson', async () => {
    // Given
    const lesson = new Lesson(
      'lesson-1',
      'title',
      'desc',
      'chapter-1',
      1,
      false,
      GameType.FILL_IN_THE_BLANK,
      [],
    );
    lessonRepository.create(lesson);
    const command: CreateGameModuleCommand = {
      lessonId: lesson.id,
      gameType: GameType.FILL_IN_THE_BLANK,
      fillInTheBlank: {
        firstText: 'The capital of France is',
        secondText: 'and it is beautiful.',
        blanks: [
          {
            text: 'Paris',
            isCorrect: true,
            correctionMessage: 'Correct! Paris is the capital of France.',
          },
          {
            text: 'London',
            isCorrect: false,
            correctionMessage: 'Incorrect. London is the capital of the UK.',
          },
        ],
      },
    };

    // When
    await useCase.execute(command);
    const modules = gameModuleRepository.findAll();

    // Then
    expect(modules.length).toBe(1);
    const fillInTheBlankModule = modules[0] as FillInTheBlankModule;
    expect(fillInTheBlankModule.firstText).toBe('The capital of France is');
    expect(fillInTheBlankModule.secondText).toBe('and it is beautiful.');
    expect(fillInTheBlankModule.blanks).toHaveLength(2);
    expect(fillInTheBlankModule.blanks[0].text).toBe('Paris');
    expect(fillInTheBlankModule.blanks[0].isCorrect).toBe(true);
  });

  it('should create a True or False module for a lesson', async () => {
    // Given
    const lesson = new Lesson(
      'lesson-1',
      'title',
      'desc',
      'chapter-1',
      1,
      false,
      GameType.TRUE_OR_FALSE,
      [],
    );
    lessonRepository.create(lesson);
    const command: CreateGameModuleCommand = {
      lessonId: lesson.id,
      gameType: GameType.TRUE_OR_FALSE,
      trueOrFalse: {
        sentence: 'The earth is round',
        isTrue: true,
      },
    };
    // When
    await useCase.execute(command);
    const modules = gameModuleRepository.findAll();

    // Then
    expect(modules.length).toBe(1);
    const trueOrFalseModule = modules[0] as TrueOrFalseModule;
    expect(trueOrFalseModule.sentence).toBe('The earth is round');
    expect(trueOrFalseModule.isTrue).toBe(true);
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

  it('should throw if Fill in the Blank data is missing', async () => {
    // Given
    const lesson = new Lesson(
      'lesson-4',
      'title',
      'desc',
      'chapter-1',
      1,
      false,
      GameType.FILL_IN_THE_BLANK,
      [],
    );
    lessonRepository.create(lesson);
    const command: CreateGameModuleCommand = {
      lessonId: lesson.id,
      gameType: GameType.FILL_IN_THE_BLANK,
    };

    // When / Then
    await expect(useCase.execute(command)).rejects.toThrow(
      FillInTheBlankModuleInvalidDataError,
    );
  });

  it('should throw if True or False data is missing', async () => {
    // Given
    const lesson = new Lesson(
      'lesson-5',
      'title',
      'desc',
      'chapter-1',
      1,
      false,
      GameType.TRUE_OR_FALSE,
      [],
    );
    lessonRepository.create(lesson);
    const command: CreateGameModuleCommand = {
      lessonId: lesson.id,
      gameType: GameType.TRUE_OR_FALSE,
    };

    // When / Then
    await expect(useCase.execute(command)).rejects.toThrow(
      TrueOrFalseModuleInvalidDataError,
    );
  });
});
