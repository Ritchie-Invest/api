import {
  CompleteGameModuleUseCase,
  CompleteGameModuleCommand,
} from '../complete-game-module.use-case';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { McqModule } from '../../domain/model/McqModule';
import { GameChoice } from '../../domain/model/GameChoice';
import { GameModuleNotFoundError } from '../../domain/error/GameModuleNotFoundError';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';
import { Progression } from '../../domain/model/Progression';
import { InMemoryProgressionRepository } from '../../../adapters/in-memory/in-memory-progression.repository';
import { GameType } from '../../domain/type/GameType';
import { MapCompleteGameModuleStrategyFactory } from '../strategies/complete-game-module-strategy-factory';
import { McqCompleteGameModuleStrategy } from '../strategies/mcq-complete-game-module-strategy';
import { Lesson } from '../../domain/model/Lesson';
import { FillInTheBlankCompleteGameModuleStrategy } from '../strategies/fill-in-the-blanks-complete-game-module-strategy';
import { FillInTheBlankModule } from '../../domain/model/FillInTheBlankModule';

describe('CompleteGameModuleUseCase', () => {
  let gameModuleRepository: InMemoryGameModuleRepository;
  let lessonRepository: InMemoryLessonRepository;
  let progressionRepository: InMemoryProgressionRepository;
  let useCase: CompleteGameModuleUseCase;

  beforeEach(() => {
    gameModuleRepository = new InMemoryGameModuleRepository();
    lessonRepository = new InMemoryLessonRepository();
    progressionRepository = new InMemoryProgressionRepository(
      gameModuleRepository,
    );

    const strategyFactory = new MapCompleteGameModuleStrategyFactory([
      {
        type: GameType.MCQ,
        strategy: new McqCompleteGameModuleStrategy(),
      },
      {
        type: GameType.FILL_IN_THE_BLANK,
        strategy: new FillInTheBlankCompleteGameModuleStrategy(),
      },
    ]);

    useCase = new CompleteGameModuleUseCase(
      gameModuleRepository,
      progressionRepository,
      lessonRepository,
      strategyFactory,
    );
    gameModuleRepository.removeAll();
    lessonRepository.removeAll();
    progressionRepository.removeAll();
  });

  const createTestLesson = () => {
    const lesson = new Lesson(
      'lesson-1',
      'Test Lesson',
      'A test lesson',
      'chapter-1',
      1,
      true,
      GameType.MCQ,
    );
    lessonRepository.create(lesson);
  };

  describe('Scenario 1: Valid answer submission', () => {
    it('should return correct answer and feedback when answer is correct', async () => {
      // Given
      createTestLesson();

      const correctChoice = new GameChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct! Paris is indeed the capital of France.',
      });

      const incorrectChoice = new GameChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage:
          'Incorrect. Lyon is a major city but not the capital.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });

      gameModuleRepository.create(mcqModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
        mcq: {
          choiceId: 'choice-1',
        },
      };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toBe(
        'Correct! Paris is indeed the capital of France.',
      );

      const progression = progressionRepository.findByUserIdAndGameModuleId(
        'user-1',
        'question-1',
      );
      expect(progression).toBeDefined();
      expect(progression!.userId).toBe('user-1');
      expect(progression!.gameModuleId).toBe('question-1');
      expect(progression!.isCompleted).toBe(true);
    });

    it('should return incorrect answer and feedback when answer is wrong', async () => {
      // Given
      createTestLesson();

      const correctChoice = new GameChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct! Paris is indeed the capital of France.',
      });

      const incorrectChoice = new GameChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage:
          'Incorrect. Lyon is a major city but not the capital.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });

      gameModuleRepository.create(mcqModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
        mcq: {
          choiceId: 'choice-2',
        },
      };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toBe(
        'Incorrect. Lyon is a major city but not the capital.',
      );

      const progression = progressionRepository.findByUserIdAndGameModuleId(
        'user-1',
        'question-1',
      );
      expect(progression).toBeNull();
    });

    it('should update existing progression when user answers again', async () => {
      // Given
      createTestLesson();

      const correctChoice = new GameChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectChoice = new GameChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });

      gameModuleRepository.create(mcqModule);

      const existingProgression = new Progression(
        'progression-1',
        'user-1',
        'question-1',
        false,
      );
      progressionRepository.create(existingProgression);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
        mcq: {
          choiceId: 'choice-1',
        },
      };

      // When
      await useCase.execute(command);

      // Then
      const updatedProgression =
        progressionRepository.findByUserIdAndGameModuleId(
          'user-1',
          'question-1',
        );
      expect(updatedProgression!.isCompleted).toBe(true);
      expect(updatedProgression!.id).toBe('progression-1');
    });
  });

  describe('Scenario 2: Invalid or empty answer', () => {
    it('should throw InvalidAnswerError when choiceId is empty', async () => {
      // Given
      createTestLesson();

      const correctChoice = new GameChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectChoice = new GameChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });

      gameModuleRepository.create(mcqModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
        mcq: {
          choiceId: '',
        },
      };

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidAnswerError,
      );
    });

    it('should throw InvalidAnswerError when choiceId is missing', async () => {
      // Given
      createTestLesson();

      const correctChoice = new GameChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectChoice = new GameChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });

      gameModuleRepository.create(mcqModule);

      const command = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
        mcq: {},
      } as CompleteGameModuleCommand;

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidAnswerError,
      );
    });

    it('should throw InvalidAnswerError when mcq is missing', async () => {
      // Given
      createTestLesson();

      const correctChoice = new GameChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectChoice = new GameChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });

      gameModuleRepository.create(mcqModule);

      const command = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
      } as CompleteGameModuleCommand;

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidAnswerError,
      );
    });

    it('should throw InvalidAnswerError when choiceId does not exist in question', async () => {
      // Given
      createTestLesson();

      const correctChoice = new GameChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const otherChoice = new GameChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, otherChoice],
      });

      gameModuleRepository.create(mcqModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
        mcq: {
          choiceId: 'non-existent-choice',
        },
      };

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidAnswerError,
      );
    });
  });

  describe('Scenario 4: Fill in the Blank valid answer submission', () => {
    it('should return correct answer and feedback when answer is correct', async () => {
      // Given
      createTestLesson();

      const correctBlank = new GameChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct! Paris is indeed the capital of France.',
      });

      const incorrectBlank = new GameChoice({
        id: 'blank-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect. Lyon is a major city but not the capital.',
      });

      const fillInTheBlankModule = new FillInTheBlankModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        firstText: 'The capital of France is',
        secondText: 'and it is beautiful.',
        blanks: [correctBlank, incorrectBlank],
      });

      gameModuleRepository.create(fillInTheBlankModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.FILL_IN_THE_BLANK,
        fillInTheBlank: {
          blankId: 'blank-1',
        },
      };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toBe('Correct! Paris is indeed the capital of France.');

      const progression = progressionRepository.findByUserIdAndGameModuleId(
        'user-1',
        'question-1',
      );
      expect(progression).toBeDefined();
      expect(progression!.userId).toBe('user-1');
      expect(progression!.gameModuleId).toBe('question-1');
      expect(progression!.isCompleted).toBe(true);
    });

    it('should return incorrect answer and feedback when answer is wrong', async () => {
      // Given
      createTestLesson();

      const correctBlank = new GameChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct! Paris is indeed the capital of France.',
      });

      const incorrectBlank = new GameChoice({
        id: 'blank-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect. Lyon is a major city but not the capital.',
      });

      const fillInTheBlankModule = new FillInTheBlankModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        firstText: 'The capital of France is',
        secondText: 'and it is beautiful.',
        blanks: [correctBlank, incorrectBlank],
      });

      gameModuleRepository.create(fillInTheBlankModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.FILL_IN_THE_BLANK,
        fillInTheBlank: {
          blankId: 'blank-2',
        },
      };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toBe('Incorrect. Lyon is a major city but not the capital.');

      const progression = progressionRepository.findByUserIdAndGameModuleId(
        'user-1',
        'question-1',
      );
      expect(progression).toBeNull();
    });

    it('should update existing progression when user answers again', async () => {
      // Given
      createTestLesson();

      const correctBlank = new GameChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectBlank = new GameChoice({
        id: 'blank-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const fillInTheBlankModule = new FillInTheBlankModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        firstText: 'The capital of France is',
        secondText: 'city.',
        blanks: [correctBlank, incorrectBlank],
      });

      gameModuleRepository.create(fillInTheBlankModule);

      const existingProgression = new Progression(
        'progression-1',
        'user-1',
        'question-1',
        false,
      );
      progressionRepository.create(existingProgression);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.FILL_IN_THE_BLANK,
        fillInTheBlank: {
          blankId: 'blank-1',
        },
      };

      // When
      await useCase.execute(command);

      // Then
      const updatedProgression = progressionRepository.findByUserIdAndGameModuleId(
        'user-1',
        'question-1',
      );
      expect(updatedProgression!.isCompleted).toBe(true);
      expect(updatedProgression!.id).toBe('progression-1');
    });
  });

  describe('Scenario 5: Fill in the Blank invalid or empty answer', () => {
    it('should throw InvalidAnswerError when blankId is empty', async () => {
      // Given
      createTestLesson();

      const correctBlank = new GameChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectBlank = new GameChoice({
        id: 'blank-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const fillInTheBlankModule = new FillInTheBlankModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        firstText: 'The capital of France is',
        secondText: 'city.',
        blanks: [correctBlank, incorrectBlank],
      });

      gameModuleRepository.create(fillInTheBlankModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.FILL_IN_THE_BLANK,
        fillInTheBlank: {
          blankId: '',
        },
      };

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
    });

    it('should throw InvalidAnswerError when blankId is missing', async () => {
      // Given
      createTestLesson();

      const correctBlank = new GameChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectBlank = new GameChoice({
        id: 'blank-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const fillInTheBlankModule = new FillInTheBlankModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        firstText: 'The capital of France is',
        secondText: 'city.',
        blanks: [correctBlank, incorrectBlank],
      });

      gameModuleRepository.create(fillInTheBlankModule);

      const command = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.FILL_IN_THE_BLANK,
        fillInTheBlank: {},
      } as CompleteGameModuleCommand;

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
    });

    it('should throw InvalidAnswerError when fillInTheBlank is missing', async () => {
      // Given
      createTestLesson();

      const correctBlank = new GameChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectBlank = new GameChoice({
        id: 'blank-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const fillInTheBlankModule = new FillInTheBlankModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        firstText: 'The capital of France is',
        secondText: 'city.',
        blanks: [correctBlank, incorrectBlank],
      });

      gameModuleRepository.create(fillInTheBlankModule);

      const command = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.FILL_IN_THE_BLANK,
      } as CompleteGameModuleCommand;

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
    });

    it('should throw InvalidAnswerError when blankId does not exist in question', async () => {
      // Given
      createTestLesson();

      const correctBlank = new GameChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const otherBlank = new GameChoice({
        id: 'blank-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const fillInTheBlankModule = new FillInTheBlankModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        firstText: 'The capital of France is',
        secondText: 'city.',
        blanks: [correctBlank, otherBlank],
      });

      gameModuleRepository.create(fillInTheBlankModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.FILL_IN_THE_BLANK,
        fillInTheBlank: {
          blankId: 'non-existent-blank',
        },
      };

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
    });
  });

  describe('Scenario 3: Non-existing question', () => {
    it('should throw GameModuleNotFoundError when moduleId does not exist', async () => {
      // Given
      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'non-existent-question',
        gameType: GameType.MCQ,
        mcq: {
          choiceId: 'choice-1',
        },
      };

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(
        GameModuleNotFoundError,
      );
    });
  });
});
