import { GameRepository } from '../../domain/repository/game.repository';
import { InMemoryGameRepository } from '../../../adapters/in-memory/in-memory-game.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import { GetGameByIdUseCase } from '../get-game-by-id.use-case';
import { GetGameByIdCommand } from '../get-game-by-id.use-case';
import { GameType } from '../../domain/type/Game/GameType';
import { GameRules } from '../../domain/type/Game/GameRules';
import { Question } from '../../domain/type/Game/Question';
import { QcmQuestion } from '../../domain/type/Game/Questions/QCM';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { GameNotFoundError } from '../../domain/error/GameNotFoundError';

describe('GetGameByIdUseCase', () => {
  let gameRepository: GameRepository;
  let getGameByIdUseCase: GetGameByIdUseCase;

  beforeEach(async () => {
    gameRepository = new InMemoryGameRepository();
    getGameByIdUseCase = new GetGameByIdUseCase(gameRepository);

    await gameRepository.removeAll();
    
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
        ],
        feedback: 'The correct answer is 4',
      } as QcmQuestion,
    ];

    await gameRepository.create({
      id: 'game-id',
      type: GameType.QCM,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-id',
      order: 1,
    });
  });

  it('should return game when user is admin', async () => {
    // Given
    const command: GetGameByIdCommand = {
      currentUser: getCurrentUser(),
      gameId: 'game-id',
    };

    // When
    const game = await getGameByIdUseCase.execute(command);

    // Then
    const games = await gameRepository.findAll();
    expect(games.length).toEqual(1);
    expect(game).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: GameType.QCM,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      rules: expect.any(Object),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      questions: expect.any(Array),
      lessonId: 'lesson-id',
      order: 1,
      isPublished: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(Date),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(Date),
    });
    const storedGame = games[0];
    expect(storedGame).toEqual({
      id: game.id,
      type: GameType.QCM,
      rules: game.rules,
      questions: game.questions,
      lessonId: 'lesson-id',
      order: 1,
      isPublished: false,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    });
  });

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: GetGameByIdCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      gameId: 'game-id',
    };

    // When & Then
    await expect(getGameByIdUseCase.execute(command)).rejects.toThrow(
      UserNotAllowedError,
    );
  });

  it('should throw an error if game does not exist', async () => {
    // Given
    const command: GetGameByIdCommand = {
      currentUser: getCurrentUser(),
      gameId: 'non-existing-game-id',
    };

    // When & Then
    await expect(getGameByIdUseCase.execute(command)).rejects.toThrow(
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
