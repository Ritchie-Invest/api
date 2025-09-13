import {
  CompleteGameModuleUseCase,
  CompleteGameModuleCommand,
} from '../complete-game-module.use-case';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { McqModule } from '../../domain/model/McqModule';
import { McqChoice } from '../../domain/model/McqChoice';
import { GameModuleNotFoundError } from '../../domain/error/GameModuleNotFoundError';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';
import { GameType } from '../../domain/type/GameType';
import { MapCompleteGameModuleStrategyFactory } from '../strategies/complete-game-module-strategy-factory';
import { McqCompleteGameModuleStrategy } from '../strategies/mcq-complete-game-module-strategy';
import { Lesson } from '../../domain/model/Lesson';
import { FillInTheBlankCompleteGameModuleStrategy } from '../strategies/fill-in-the-blanks-complete-game-module-strategy';
import { TrueOrFalseCompleteGameModuleStrategy } from '../strategies/true-or-false-complete-game-module-strategy';
import { FillInTheBlankModule } from '../../domain/model/FillInTheBlankModule';
import { FillInTheBlankChoice } from '../../domain/model/FillInTheBlankChoice';
import { TrueOrFalseModule } from '../../domain/model/TrueOrFalseModule';
import { InMemoryModuleAttemptRepository } from '../../../adapters/in-memory/in-memory-module-attempt.repository';
import { InMemoryLessonAttemptRepository } from '../../../adapters/in-memory/in-memory-lesson-attempt.repository';
import { LifeService } from '../services/life.service';

describe('CompleteGameModuleUseCase', () => {
  let gameModuleRepository: InMemoryGameModuleRepository;
  let lessonRepository: InMemoryLessonRepository;
  let lessonAttemptRepository: InMemoryLessonAttemptRepository;
  let moduleAttemptRepository: InMemoryModuleAttemptRepository;
  let mockLifeService: jest.Mocked<LifeService>;
  let useCase: CompleteGameModuleUseCase;

  beforeEach(() => {
    gameModuleRepository = new InMemoryGameModuleRepository();
    lessonRepository = new InMemoryLessonRepository();
    lessonAttemptRepository = new InMemoryLessonAttemptRepository();
    moduleAttemptRepository = new InMemoryModuleAttemptRepository();

    // Mock LifeService
    mockLifeService = {
      getUserLifeData: jest.fn(),
      addLostLife: jest.fn(),
    } as any;
    // Valeur par défaut pour éviter les échecs des tests existants en cas de réponse incorrecte
    mockLifeService.getUserLifeData.mockResolvedValue({
      life_number: 5,
      next_life_in: 1200,
      has_lost: false,
    });

    const strategyFactory = new MapCompleteGameModuleStrategyFactory([
      {
        type: GameType.MCQ,
        strategy: new McqCompleteGameModuleStrategy(),
      },
      {
        type: GameType.FILL_IN_THE_BLANK,
        strategy: new FillInTheBlankCompleteGameModuleStrategy(),
      },
      {
        type: GameType.TRUE_OR_FALSE,
        strategy: new TrueOrFalseCompleteGameModuleStrategy(),
      },
    ]);

    useCase = new CompleteGameModuleUseCase(
      gameModuleRepository,
      lessonRepository,
      strategyFactory,
      lessonAttemptRepository,
      moduleAttemptRepository,
      mockLifeService,
    );
    moduleAttemptRepository.removeAll();
    lessonAttemptRepository.removeAll();
    gameModuleRepository.removeAll();
    lessonRepository.removeAll();
  });

  const createTestLesson = () => {
    const lesson = new Lesson(
      'lesson-1',
      'Test Lesson',
      'A test lesson',
      'chapter-1',
      1,
      true,
    );
    lessonRepository.create(lesson);
  };

  it('should return correct answer and feedback when answer is correct', async () => {
    // Given
    createTestLesson();

    const correctChoice = new McqChoice({
      id: 'choice-1',
      text: 'Paris',
      isCorrect: true,
      correctionMessage: 'Correct! Paris is indeed the capital of France.',
    });

    const incorrectChoice = new McqChoice({
      id: 'choice-2',
      text: 'Lyon',
      isCorrect: false,
      correctionMessage: 'Incorrect. Lyon is a major city but not the capital.',
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
    expect(result.correctChoiceId).toBe('choice-1');

    const lessonAttempt = lessonAttemptRepository.findLastByUserIdAndLessonId(
      'user-1',
      'lesson-1',
    );
    expect(lessonAttempt).toBeDefined();
    const moduleAttempts = moduleAttemptRepository.findAllByLessonAttemptId(
      lessonAttempt!.id,
    );
    expect(moduleAttempts.length).toBe(1);
    expect(moduleAttempts[0]?.isCorrect).toBe(true);
    expect(moduleAttempts[0]?.userId).toBe('user-1');
    expect(moduleAttempts[0]?.gameModuleId).toBe('question-1');
  });

  it('should return incorrect answer and feedback when answer is wrong', async () => {
    // Given
    createTestLesson();

    const correctChoice = new McqChoice({
      id: 'choice-1',
      text: 'Paris',
      isCorrect: true,
      correctionMessage: 'Correct! Paris is indeed the capital of France.',
    });

    const incorrectChoice = new McqChoice({
      id: 'choice-2',
      text: 'Lyon',
      isCorrect: false,
      correctionMessage: 'Incorrect. Lyon is a major city but not the capital.',
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
    expect(result.correctChoiceId).toBe('choice-1');
    const lessonAttempt = lessonAttemptRepository.findLastByUserIdAndLessonId(
      'user-1',
      'lesson-1',
    );
    expect(lessonAttempt).toBeDefined();
    const moduleAttempts = moduleAttemptRepository.findAllByLessonAttemptId(
      lessonAttempt!.id,
    );
    expect(moduleAttempts.length).toBe(1);
    expect(moduleAttempts[0]?.isCorrect).toBe(false);
    expect(moduleAttempts[0]?.userId).toBe('user-1');
    expect(moduleAttempts[0]?.gameModuleId).toBe('question-1');
    // Vérifie appel perte de vie
    expect(mockLifeService.addLostLife).toHaveBeenCalledWith('user-1');
    expect(mockLifeService.getUserLifeData).toHaveBeenCalledWith('user-1');
    expect(result.isLost).toBe(false);
  });

  describe('Scenario 4: Fill in the Blank valid answer submission', () => {
    it('should return correct answer and feedback when answer is correct', async () => {
      // Given
      createTestLesson();

      const correctBlank = new FillInTheBlankChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct! Paris is indeed the capital of France.',
      });

      const incorrectBlank = new FillInTheBlankChoice({
        id: 'blank-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage:
          'Incorrect. Lyon is a major city but not the capital.',
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
      expect(result.feedback).toBe(
        'Correct! Paris is indeed the capital of France.',
      );
    });

    it('should return incorrect answer and feedback when answer is wrong', async () => {
      // Given
      createTestLesson();

      const correctBlank = new FillInTheBlankChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct! Paris is indeed the capital of France.',
      });

      const incorrectBlank = new FillInTheBlankChoice({
        id: 'blank-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage:
          'Incorrect. Lyon is a major city but not the capital.',
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
      expect(result.feedback).toBe(
        'Incorrect. Lyon is a major city but not the capital.',
      );
      expect(mockLifeService.addLostLife).toHaveBeenCalledWith('user-1');
      expect(mockLifeService.getUserLifeData).toHaveBeenCalledWith('user-1');
      expect(result.isLost).toBe(false);
    });
  });

  describe('Scenario 5: Fill in the Blank invalid or empty answer', () => {
    it('should throw InvalidAnswerError when blankId is empty', async () => {
      // Given
      createTestLesson();

      const correctBlank = new FillInTheBlankChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectBlank = new FillInTheBlankChoice({
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
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidAnswerError,
      );
    });

    it('should throw InvalidAnswerError when blankId is missing', async () => {
      // Given
      createTestLesson();

      const correctBlank = new FillInTheBlankChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectBlank = new FillInTheBlankChoice({
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
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidAnswerError,
      );
    });

    it('should throw InvalidAnswerError when fillInTheBlank is missing', async () => {
      // Given
      createTestLesson();

      const correctBlank = new FillInTheBlankChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectBlank = new FillInTheBlankChoice({
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
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidAnswerError,
      );
    });

    it('should throw InvalidAnswerError when blankId does not exist in question', async () => {
      // Given
      createTestLesson();

      const correctBlank = new FillInTheBlankChoice({
        id: 'blank-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const otherBlank = new FillInTheBlankChoice({
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
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidAnswerError,
      );
    });
  });

  describe('Scenario 6: True or False valid answer submission', () => {
    it('should return correct answer and feedback when answer is correct', async () => {
      // Given
      createTestLesson();

      const trueOrFalseModule = new TrueOrFalseModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        sentence: 'Paris is the capital of France',
        isTrue: true,
      });

      gameModuleRepository.create(trueOrFalseModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.TRUE_OR_FALSE,
        trueOrFalse: true,
      };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toBe('Correct! Well done.');
    });

    it('should return incorrect answer and feedback when answer is wrong', async () => {
      // Given
      createTestLesson();

      const trueOrFalseModule = new TrueOrFalseModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        sentence: 'Paris is the capital of France',
        isTrue: true,
      });

      gameModuleRepository.create(trueOrFalseModule);

      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.TRUE_OR_FALSE,
        trueOrFalse: false,
      };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toBe('Incorrect. The correct answer is: True');
      expect(mockLifeService.addLostLife).toHaveBeenCalledWith('user-1');
      expect(mockLifeService.getUserLifeData).toHaveBeenCalledWith('user-1');
      expect(result.isLost).toBe(false);
    });
  });

  describe('Scenario 7: True or False invalid or empty answer', () => {
    it('should throw InvalidAnswerError when trueOrFalse answer is undefined', async () => {
      // Given
      createTestLesson();

      const trueOrFalseModule = new TrueOrFalseModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        sentence: 'Paris is the capital of France',
        isTrue: true,
      });

      gameModuleRepository.create(trueOrFalseModule);

      const command = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.TRUE_OR_FALSE,
      } as CompleteGameModuleCommand;

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidAnswerError,
      );
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

  describe('Scenario 6: MCQ invalid or empty answer', () => {
    it('should throw InvalidAnswerError when choiceId is empty', async () => {
      // Given
      createTestLesson();

      const correctChoice = new McqChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectChoice = new McqChoice({
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

      const correctChoice = new McqChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectChoice = new McqChoice({
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

      const correctChoice = new McqChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const incorrectChoice = new McqChoice({
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

      const correctChoice = new McqChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });

      const otherChoice = new McqChoice({
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

  it('should not allow retrying a module for the same lesson attempt', async () => {
    // Given
    createTestLesson();
    const correctChoice = new McqChoice({
      id: 'choice-1',
      text: 'Paris',
      isCorrect: true,
      correctionMessage: 'Correct! Paris is indeed the capital of France.',
    });
    const incorrectChoice = new McqChoice({
      id: 'choice-2',
      text: 'Lyon',
      isCorrect: false,
      correctionMessage: 'Incorrect. Lyon is a major city but not the capital.',
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
      mcq: { choiceId: 'choice-1' },
    };

    // When
    await useCase.execute(command);

    // Then
    const lessonAttempt = lessonAttemptRepository.findLastByUserIdAndLessonId(
      'user-1',
      'lesson-1',
    );
    await expect(useCase.execute(command)).rejects.toThrow(
      `Module with id question-1 has already been attempted in lesson attempt ${lessonAttempt?.id}`,
    );
  });

  describe('Life management logic', () => {
    const prepareMcq = () => {
      createTestLesson();
      const correctChoice = new McqChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct! Paris is indeed the capital of France.',
      });
      const incorrectChoice = new McqChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect. Lyon is a major city but not the capital.',
      });
      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });
      gameModuleRepository.create(mcqModule);
    };

    it('should call addLostLife and return isLost=false when life not exhausted', async () => {
      prepareMcq();
      mockLifeService.getUserLifeData.mockResolvedValueOnce({
        life_number: 3,
        next_life_in: 1800,
        has_lost: false,
      });
      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
        mcq: { choiceId: 'choice-2' },
      };
      const result = await useCase.execute(command);
      expect(mockLifeService.addLostLife).toHaveBeenCalledTimes(1);
      expect(mockLifeService.addLostLife).toHaveBeenCalledWith('user-1');
      expect(mockLifeService.getUserLifeData).toHaveBeenCalledTimes(1);
      expect(result.isLost).toBe(false);
    });

    it('should set isLost=true when life service indicates user has lost all lives', async () => {
      prepareMcq();
      mockLifeService.getUserLifeData.mockResolvedValueOnce({
        life_number: 0,
        next_life_in: 3600,
        has_lost: true,
      });
      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
        mcq: { choiceId: 'choice-2' },
      };
      const result = await useCase.execute(command);
      expect(mockLifeService.addLostLife).toHaveBeenCalledTimes(1);
      expect(mockLifeService.getUserLifeData).toHaveBeenCalledTimes(1);
      expect(result.isLost).toBe(true);
    });

    it('should not call life service on correct answer', async () => {
      prepareMcq();
      const command: CompleteGameModuleCommand = {
        userId: 'user-1',
        moduleId: 'question-1',
        gameType: GameType.MCQ,
        mcq: { choiceId: 'choice-1' },
      };
      const result = await useCase.execute(command);
      expect(mockLifeService.addLostLife).not.toHaveBeenCalled();
      expect(mockLifeService.getUserLifeData).not.toHaveBeenCalled();
      expect(result.isLost).toBe(false);
    });
  });
});
