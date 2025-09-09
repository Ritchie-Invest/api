import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { GameType } from '../../domain/type/GameType';
import { Lesson } from '../../domain/model/Lesson';
import { LessonNotFoundError } from '../../domain/error/LessonNotFoundError';
import { McqModuleStrategy } from '../strategies/mcq-module-strategy';
import { MapGameModuleStrategyFactory } from '../strategies/game-module-strategy-factory';
import { McqModule } from '../../domain/model/McqModule';
import { McqModuleInvalidDataError } from '../../domain/error/McqModuleInvalidDataError';
import {
  UpdateGameModuleCommand,
  UpdateGameModuleUseCase,
} from '../update-game-module.use-case';
import { GameModuleNotFoundError } from '../../domain/error/GameModuleNotFoundError';
import { FillInTheBlankModuleStrategy } from '../strategies/fill-in-the-blanks-module-strategy';
import { TrueOrFalseModuleStrategy } from '../strategies/true-or-false-module-strategy';
import { FillInTheBlankModule } from '../../domain/model/FillInTheBlankModule';
import { TrueOrFalseModule } from '../../domain/model/TrueOrFalseModule';
import { FillInTheBlankModuleInvalidDataError } from '../../domain/error/FillInTheBlankModuleInvalidDataError';
import { McqChoice } from '../../domain/model/McqChoice';
import { FillInTheBlankChoice } from '../../domain/model/FillInTheBlankChoice';

describe('UpdateGameModuleUseCase', () => {
  let lessonRepository: InMemoryLessonRepository;
  let gameModuleRepository: InMemoryGameModuleRepository;
  let useCase: UpdateGameModuleUseCase;

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
    useCase = new UpdateGameModuleUseCase(
      lessonRepository,
      gameModuleRepository,
      strategyFactory,
    );
    gameModuleRepository.removeAll();
    lessonRepository.removeAll();
  });

  it('should update a MCQ module', async () => {
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
    const mcqModule = new McqModule({
      id: 'module-1',
      lessonId: lesson.id,
      question: 'What is 1+1?',
      choices: [
        new McqChoice({
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        }),
        new McqChoice({
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        }),
      ],
    });
    gameModuleRepository.create(mcqModule);
    const command: UpdateGameModuleCommand = {
      gameModuleId: 'module-1',
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

    // Then
    const module = gameModuleRepository.findById('module-1') as McqModule;
    expect(module.question).toBe('What is 2+2?');
  });

  it('should update a Fill in the Blank module', async () => {
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
    const fillInTheBlankModule = new FillInTheBlankModule({
      id: 'module-1',
      lessonId: lesson.id,
      firstText: 'The capital of France is',
      secondText: 'city.',
      blanks: [
        new FillInTheBlankChoice({
          id: 'blank-1',
          text: 'Paris',
          isCorrect: true,
          correctionMessage: 'Correct!',
        }),
        new FillInTheBlankChoice({
          id: 'blank-2',
          text: 'Lyon',
          isCorrect: false,
          correctionMessage: 'Incorrect.',
        }),
      ],
    });
    gameModuleRepository.create(fillInTheBlankModule);
    const command: UpdateGameModuleCommand = {
      gameModuleId: 'module-1',
      fillInTheBlank: {
        firstText: 'The largest city in France is',
        secondText: 'and it is amazing.',
        blanks: [
          { text: 'Paris', isCorrect: true, correctionMessage: 'Yes!' },
          { text: 'Lyon', isCorrect: false, correctionMessage: 'No' },
        ],
      },
    };

    // When
    await useCase.execute(command);

    // Then
    const module = gameModuleRepository.findById(
      'module-1',
    ) as FillInTheBlankModule;
    expect(module.firstText).toBe('The largest city in France is');
    expect(module.secondText).toBe('and it is amazing.');
    expect(module.blanks).toHaveLength(2);
    expect(module.blanks[0]?.text).toBe('Paris');
    expect(module.blanks[0]?.isCorrect).toBe(true);
  });

  it('should update a True or False module', async () => {
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
    const trueOrFalseModule = new TrueOrFalseModule({
      id: 'module-1',
      lessonId: lesson.id,
      sentence: 'The earth is flat',
      isTrue: false,
    });
    gameModuleRepository.create(trueOrFalseModule);
    const command: UpdateGameModuleCommand = {
      gameModuleId: 'module-1',
      trueOrFalse: {
        sentence: 'The earth is round',
        isTrue: true,
      },
    };

    // When
    await useCase.execute(command);

    // Then
    const module = gameModuleRepository.findById(
      'module-1',
    ) as TrueOrFalseModule;
    expect(module.sentence).toBe('The earth is round');
    expect(module.isTrue).toBe(true);
  });

  it('should throw if game module not found', async () => {
    const command: UpdateGameModuleCommand = {
      gameModuleId: 'non-existing-module',
      mcq: {
        question: 'Q?',
        choices: [
          { text: 'A', isCorrect: true, correctionMessage: 'ok' },
          { text: 'B', isCorrect: false, correctionMessage: 'no' },
        ],
      },
    };
    await expect(useCase.execute(command)).rejects.toThrow(
      GameModuleNotFoundError,
    );
  });

  it('should throw if lesson not found', async () => {
    // Given
    const mcqModule = new McqModule({
      id: 'module-2',
      lessonId: 'non-existing-lesson',
      question: 'What is 1+1?',
      choices: [
        new McqChoice({
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        }),
        new McqChoice({
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        }),
      ],
    });
    gameModuleRepository.create(mcqModule);
    const command: UpdateGameModuleCommand = {
      gameModuleId: 'module-2',
      mcq: {
        question: 'What is 2+2?',
        choices: [
          { text: '3', isCorrect: false, correctionMessage: 'No' },
          { text: '4', isCorrect: true, correctionMessage: 'Yes' },
        ],
      },
    };

    // When / Then
    await expect(useCase.execute(command)).rejects.toThrow(LessonNotFoundError);
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
    const mcqModule = new McqModule({
      id: 'module-1',
      lessonId: lesson.id,
      question: 'What is 1+1?',
      choices: [
        new McqChoice({
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        }),
        new McqChoice({
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        }),
      ],
    });
    gameModuleRepository.create(mcqModule);
    const command: UpdateGameModuleCommand = {
      gameModuleId: 'module-1',
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
    const fillInTheBlankModule = new FillInTheBlankModule({
      id: 'module-1',
      lessonId: lesson.id,
      firstText: 'The capital is',
      secondText: 'city.',
      blanks: [
        new FillInTheBlankChoice({
          id: 'blank-1',
          text: 'Paris',
          isCorrect: true,
          correctionMessage: 'Correct!',
        }),
        new FillInTheBlankChoice({
          id: 'blank-2',
          text: 'Lyon',
          isCorrect: false,
          correctionMessage: 'Incorrect.',
        }),
      ],
    });
    gameModuleRepository.create(fillInTheBlankModule);
    const command: UpdateGameModuleCommand = {
      gameModuleId: 'module-1',
    };

    // When / Then
    await expect(useCase.execute(command)).rejects.toThrow(
      FillInTheBlankModuleInvalidDataError,
    );
  });
});
