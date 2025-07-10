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

describe('UpdateGameModuleUseCase', () => {
  let lessonRepository: InMemoryLessonRepository;
  let gameModuleRepository: InMemoryGameModuleRepository;
  let useCase: UpdateGameModuleUseCase;

  beforeEach(() => {
    lessonRepository = new InMemoryLessonRepository();
    gameModuleRepository = new InMemoryGameModuleRepository();
    const mcqStrategy = new McqModuleStrategy();
    const strategyFactory = new MapGameModuleStrategyFactory([
      { type: GameType.MCQ, strategy: mcqStrategy },
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
        {
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        },
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
    const module = gameModuleRepository.findById('module-1');
    expect((module as McqModule).question).toBe('What is 2+2?');
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
        {
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        },
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
        {
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        },
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
});
