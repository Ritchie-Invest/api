import { GameRepository } from '../../domain/repository/game.repository';
import { InMemoryGameRepository } from '../../../adapters/in-memory/in-memory-game.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import { DeleteGameCommand, DeleteGameUseCase } from '../delete-game.use-case';
import { GameType } from '../../domain/type/Game/GameType';
import { GameRules } from '../../domain/type/Game/GameRules';
import { Question } from '../../domain/type/Game/Question';
import { QcmQuestion } from '../../domain/type/Game/Questions/QCM';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { GameNotFoundError } from '../../domain/error/GameNotFoundError';

describe('DeleteGameUseCase', () => {
  let gameRepository: GameRepository;
  let deleteGameUseCase: DeleteGameUseCase;

  beforeEach(async () => {
    gameRepository = new InMemoryGameRepository();
    deleteGameUseCase = new DeleteGameUseCase(gameRepository);

    await gameRepository.removeAll();

    const mockRules: GameRules = {
      shuffle_questions: false,
      time_limit_seconds: 60,
    };

    const mockQuestions: Question[] = [
      {
        question: 'Test question?',
        options: [
          { value: 'Yes', is_valid: true },
          { value: 'No', is_valid: false },
        ],
        feedback: 'The correct answer is Yes',
      } as QcmQuestion,
    ];

    await gameRepository.create({
      id: 'game-id',
      type: GameType.QCM,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-1',
      order: 1,
    });
  });

  it('should delete game successfully', async () => {
    // GIVEN
    const command: DeleteGameCommand = {
      currentUser: getCurrentUser(),
      gameId: 'game-id',
    };

    // WHEN
    await deleteGameUseCase.execute(command);

    // THEN
    const games = await gameRepository.findAll();
    expect(games.length).toEqual(0);
    
    const deletedGame = await gameRepository.findById('game-id');
    expect(deletedGame).toBeNull();
  });

  it('should throw an error if user is not admin', async () => {
    // GIVEN
    const command: DeleteGameCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      gameId: 'game-id',
    };

    // WHEN & THEN
    await expect(deleteGameUseCase.execute(command)).rejects.toThrow(
      UserNotAllowedError,
    );
    await expect(deleteGameUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can delete games',
    );

    // Game should still exist
    const games = await gameRepository.findAll();
    expect(games.length).toEqual(1);
  });

  it('should throw an error if game does not exist', async () => {
    // GIVEN
    const command: DeleteGameCommand = {
      currentUser: getCurrentUser(),
      gameId: 'non-existing-game-id',
    };

    // WHEN & THEN
    await expect(deleteGameUseCase.execute(command)).rejects.toThrow(
      GameNotFoundError,
    );
    await expect(deleteGameUseCase.execute(command)).rejects.toThrow(
      'Game with id non-existing-game-id not found',
    );
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
