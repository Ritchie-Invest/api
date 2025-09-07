import {
  CompleteGameModuleUseCase,
  CompleteGameModuleCommand,
} from '../complete-game-module.use-case';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { McqModule } from '../../domain/model/McqModule';
import { MatchModule } from '../../domain/model/MatchModule';
import { McqChoice } from '../../domain/model/McqChoice';
import { MatchChoice } from '../../domain/model/MatchChoice';
import { GameModuleNotFoundError } from '../../domain/error/GameModuleNotFoundError';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';
import { GameType } from '../../domain/type/GameType';
import { MapCompleteGameModuleStrategyFactory } from '../strategies/complete-game-module-strategy-factory';
import { McqCompleteGameModuleStrategy } from '../strategies/mcq-complete-game-module-strategy';
import { MatchCompleteGameModuleStrategy } from '../strategies/match-complete-game-module-strategy';
import { Lesson } from '../../domain/model/Lesson';
import { InMemoryModuleAttemptRepository } from '../../../adapters/in-memory/in-memory-module-attempt.repository';
import { InMemoryLessonAttemptRepository } from '../../../adapters/in-memory/in-memory-lesson-attempt.repository';

describe('CompleteGameModuleUseCase', () => {
  let gameModuleRepository: InMemoryGameModuleRepository;
  let lessonRepository: InMemoryLessonRepository;
  let lessonAttemptRepository: InMemoryLessonAttemptRepository;
  let moduleAttemptRepository: InMemoryModuleAttemptRepository;
  let useCase: CompleteGameModuleUseCase;

  beforeEach(() => {
    gameModuleRepository = new InMemoryGameModuleRepository();
    lessonRepository = new InMemoryLessonRepository();
    lessonAttemptRepository = new InMemoryLessonAttemptRepository();
    moduleAttemptRepository = new InMemoryModuleAttemptRepository();

    const strategyFactory = new MapCompleteGameModuleStrategyFactory([
      {
        type: GameType.MCQ,
        strategy: new McqCompleteGameModuleStrategy(),
      },
      {
        type: GameType.MATCH,
        strategy: new MatchCompleteGameModuleStrategy(),
      },
    ]);

    useCase = new CompleteGameModuleUseCase(
      gameModuleRepository,
      lessonRepository,
      strategyFactory,
      lessonAttemptRepository,
      moduleAttemptRepository,
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
      GameType.MCQ,
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
  });

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
    await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
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
    await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
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
    await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
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
    await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
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

  it('should complete a Match module with correct answers', async () => {
    // Given
    createTestMatchLesson();
    const matchModule = new MatchModule({
      id: 'match-1',
      lessonId: 'lesson-match',
      instruction: 'Match the animals with their types',
      matches: [
        new MatchChoice({ id: 'match-1', value1: 'Cat', value2: 'Mammal' }),
        new MatchChoice({ id: 'match-2', value1: 'Eagle', value2: 'Bird' }),
      ],
    });
    gameModuleRepository.create(matchModule);
    const command: CompleteGameModuleCommand = {
      userId: 'user-1',
      moduleId: 'match-1',
      gameType: GameType.MATCH,
      match: {
        answers: [
          { value1: 'Cat', value2: 'Mammal' },
          { value1: 'Eagle', value2: 'Bird' },
        ],
      },
    };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toBe('Toutes les correspondances sont correctes !');
    expect(result.correctChoiceId).toBe('match-1');
  });

  it('should complete a Match module with incorrect answers', async () => {
    // Given
    createTestMatchLesson();
    const matchModule = new MatchModule({
      id: 'match-2',
      lessonId: 'lesson-match',
      instruction: 'Match the animals with their types',
      matches: [
        new MatchChoice({ id: 'match-1', value1: 'Cat', value2: 'Mammal' }),
        new MatchChoice({ id: 'match-2', value1: 'Eagle', value2: 'Bird' }),
      ],
    });
    gameModuleRepository.create(matchModule);
    const command: CompleteGameModuleCommand = {
      userId: 'user-1',
      moduleId: 'match-2',
      gameType: GameType.MATCH,
      match: {
        answers: [
          { value1: 'Cat', value2: 'Bird' },
          { value1: 'Eagle', value2: 'Mammal' },
        ],
      },
    };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('Correspondances incorrectes');
  });

  it('should throw if Match answers are missing', async () => {
    // Given
    createTestMatchLesson();
    const matchModule = new MatchModule({
      id: 'match-3',
      lessonId: 'lesson-match',
      instruction: 'Match the animals with their types',
      matches: [
        new MatchChoice({ id: 'match-1', value1: 'Cat', value2: 'Mammal' }),
        new MatchChoice({ id: 'match-2', value1: 'Eagle', value2: 'Bird' }),
      ],
    });
    gameModuleRepository.create(matchModule);
    const command: CompleteGameModuleCommand = {
      userId: 'user-1',
      moduleId: 'match-3',
      gameType: GameType.MATCH,
    };

    // When & Then
    await expect(useCase.execute(command)).rejects.toThrow(
      'Match answers are required',
    );
  });

  function createTestMatchLesson() {
    const lesson = new Lesson(
      'lesson-match',
      'Match Lesson',
      'A lesson for matching',
      'chapter-1',
      1,
      true,
      GameType.MATCH,
      [],
    );
    lessonRepository.create(lesson);
  }
});
