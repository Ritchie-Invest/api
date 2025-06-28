import { GameRepository } from '../../domain/repository/game.repository';
import { InMemoryGameRepository } from '../../../adapters/in-memory/in-memory-game.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import { UpdateGameCommand, UpdateGameUseCase } from '../update-game.use-case';
import { GameType } from '../../domain/type/Game/GameType';
import { GameRules } from '../../domain/type/Game/GameRules';
import { Question } from '../../domain/type/Game/Question';
import { QcmQuestion } from '../../domain/type/Game/Questions/QCM';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { GameNotFoundError } from '../../domain/error/GameNotFoundError';

describe('UpdateGameUseCase', () => {
  let gameRepository: GameRepository;
  let updateGameUseCase: UpdateGameUseCase;

  beforeEach(async () => {
    gameRepository = new InMemoryGameRepository();
    updateGameUseCase = new UpdateGameUseCase(gameRepository);

    await gameRepository.removeAll();
    
    const mockRules: GameRules = {
      shuffle_questions: false,
      time_limit_seconds: 60,
    };
    
    const mockQuestions: Question[] = [
      {
        question: 'Original question?',
        options: [
          { value: 'Yes', is_valid: true },
          { value: 'No', is_valid: false },
        ],
        feedback: 'The correct answer is Yes',
      } as QcmQuestion,
    ];

    await gameRepository.create({
      id: 'game-id',
      type: GameType.TRUE_OR_FALSE,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-1',
      order: 1,
    });
  });

  it('should return updated game', async () => {
    // GIVEN
    const updatedRules: GameRules = {
      shuffle_questions: true,
      time_limit_seconds: 120,
    };
    
    const updatedQuestions: Question[] = [
      {
        question: 'Updated question?',
        options: [
          { value: 'Updated Yes', is_valid: true },
          { value: 'Updated No', is_valid: false },
        ],
        feedback: 'The updated correct answer is Updated Yes',
      } as QcmQuestion,
    ];

    const command: UpdateGameCommand = {
      currentUser: getCurrentUser(),
      gameId: 'game-id',
      type: GameType.QCM,
      rules: updatedRules,
      questions: updatedQuestions,
      isPublished: true,
      order: 2,
    };

    // WHEN
    const game = await updateGameUseCase.execute(command);

    // THEN
    const games = await gameRepository.findAll();
    expect(games.length).toEqual(1);
    expect(game).toEqual({
      id: 'game-id',
      type: GameType.QCM,
      rules: updatedRules,
      questions: updatedQuestions,
      lessonId: 'lesson-1', // lessonId should not change - keeps original value
      isPublished: true,
      order: 2,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    });
    const storedGame = games[0];
    expect(storedGame).toEqual({
      id: game.id,
      type: GameType.QCM,
      rules: updatedRules,
      questions: updatedQuestions,
      lessonId: 'lesson-1', // lessonId should not change - keeps original value
      isPublished: true,
      order: 2,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    });
  });

  it('should throw an error if user is not admin', async () => {
    // GIVEN
    const command: UpdateGameCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      gameId: 'game-id',
      type: GameType.QCM,
      rules: {
        shuffle_questions: true,
        time_limit_seconds: 30,
      },
      questions: [],
      order: 1,
      isPublished: true,
    };

    // WHEN & THEN
    await expect(updateGameUseCase.execute(command)).rejects.toThrow(
      UserNotAllowedError,
    );
  });

  it('should throw an error if game does not exist', async () => {
    // GIVEN
    const command: UpdateGameCommand = {
      currentUser: getCurrentUser(),
      gameId: 'non-existing-game-id',
      type: GameType.QCM,
      rules: {
        shuffle_questions: true,
        time_limit_seconds: 30,
      },
      questions: [],
      order: 1,
      isPublished: true,
    };

    // WHEN & THEN
    await expect(updateGameUseCase.execute(command)).rejects.toThrow(
      GameNotFoundError,
    );
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
