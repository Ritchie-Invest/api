import { CreateGameUseCase } from '../create-game.use-case';
import { CreateGameCommand } from '../create-game.use-case';
import { UserType } from '../../domain/type/UserType';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { InMemoryGameRepository } from '../../../adapters/in-memory/in-memory-game.repository';
import { GameType } from '../../domain/type/Game/GameType';
import { GameRules } from '../../domain/type/Game/GameRules';
import { Question } from '../../domain/type/Game/Question';
import { QcmQuestion } from '../../domain/type/Game/Questions/QCM';

describe('CreateGameUseCase', () => {
  let useCase: CreateGameUseCase;
  let gameRepository: InMemoryGameRepository;

  beforeEach(() => {
    gameRepository = new InMemoryGameRepository();
    useCase = new CreateGameUseCase(gameRepository);
  });

  it('should create a game when user is admin', async () => {
    // GIVEN
    const mockRules: GameRules = {
      shuffle_questions: true,
      time_limit_seconds: 30,
    };
    
    const mockQuestions: Question[] = [
      {
        question: 'What is 2+2?',
        options: [
          { value: '4', is_valid: true },
          { value: '3', is_valid: false },
          { value: '5', is_valid: false },
          { value: '6', is_valid: false },
        ],
        feedback: 'The correct answer is 4',
      } as QcmQuestion,
    ];

    const command: CreateGameCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      type: GameType.QCM,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-1',
      order: 1,
    };

    // WHEN
    const result = await useCase.execute(command);

    // THEN
    expect(result.type).toBe(command.type);
    expect(result.rules).toEqual(command.rules);
    expect(result.questions).toEqual(command.questions);
    expect(result.lessonId).toBe(command.lessonId);
    expect(result.order).toBe(command.order);
    expect(result.isPublished).toBe(false);
    expect(gameRepository.findAll().length).toBe(1);
  });

  it('should create a published game when isPublished is true', async () => {
    // GIVEN
    const mockRules: GameRules = {
      shuffle_questions: false,
      time_limit_seconds: 60,
    };
    
    const mockQuestions: Question[] = [
      {
        question: 'What is the capital of France?',
        options: [
          { value: 'Paris', is_valid: true },
          { value: 'London', is_valid: false },
          { value: 'Berlin', is_valid: false },
          { value: 'Madrid', is_valid: false },
        ],
        feedback: 'The correct answer is Paris',
      } as QcmQuestion,
    ];

    const command: CreateGameCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      type: GameType.MATCH_THE_WORD,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-2',
      order: 2,
      isPublished: true,
    };

    // WHEN
    const result = await useCase.execute(command);

    // THEN
    expect(result.isPublished).toBe(true);
    expect(gameRepository.findAll().length).toBe(1);
  });

  it('should throw UserNotAllowedError if user is not admin', async () => {
    // GIVEN
    const mockRules: GameRules = {
      shuffle_questions: true,
      time_limit_seconds: 30,
    };
    
    const mockQuestions: Question[] = [
      {
        question: 'Test question?',
        options: [
          { value: 'A', is_valid: true },
          { value: 'B', is_valid: false },
          { value: 'C', is_valid: false },
          { value: 'D', is_valid: false },
        ],
        feedback: 'The correct answer is A',
      } as QcmQuestion,
    ];

    const command: CreateGameCommand = {
      currentUser: { id: 'user-id', type: UserType.STUDENT },
      type: GameType.QCM,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-1',
      order: 1,
    };

    // THEN
    await expect(useCase.execute(command)).rejects.toThrow(UserNotAllowedError);
    expect(gameRepository.findAll().length).toBe(0);
  });
});
