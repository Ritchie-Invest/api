import { GameRepository } from '../../domain/repository/game.repository';
import { InMemoryGameRepository } from '../../../adapters/in-memory/in-memory-game.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  getGamesByLessonIdCommand,
  getGamesByLessonIdUseCase,
} from '../get-games-by-lesson.use-case';
import { GameType } from '../../domain/type/Game/GameType';
import { GameRules } from '../../domain/type/Game/GameRules';
import { Question } from '../../domain/type/Game/Question';
import { QcmQuestion } from '../../domain/type/Game/Questions/QCM';

describe('getGamesByLessonIdUseCase', () => {
  let gameRepository: GameRepository;
  let getGamesUseCase: getGamesByLessonIdUseCase;

  beforeEach(async () => {
    gameRepository = new InMemoryGameRepository();
    getGamesUseCase = new getGamesByLessonIdUseCase(gameRepository);

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
      lessonId: 'some-lesson-id',
      order: 1,
    });
    await gameRepository.create({
      id: 'another-game-id',
      type: GameType.TRUE_OR_FALSE,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'some-lesson-id',
      order: 2,
    });
    await gameRepository.create({
      id: 'third-game-id',
      type: GameType.MATCH_THE_WORD,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'other-lesson-id',
      order: 3,
    });
  });

  it('should return games for the specified lesson', async () => {
    // Given
    const command: getGamesByLessonIdCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'some-lesson-id',
    };

    // When
    const games = await getGamesUseCase.execute(command);

    // Then
    const storedGames = await gameRepository.findAll();
    expect(games.length).toBe(2);

    expect(games[0]).toMatchObject({
      type: GameType.QCM,
      lessonId: 'some-lesson-id',
      isPublished: false,
      order: 1,
    });
    expect(typeof games[0]?.id).toBe('string');
    expect(games[0]?.createdAt).toBeInstanceOf(Date);
    expect(games[0]?.updatedAt).toBeInstanceOf(Date);

    expect(games[1]).toMatchObject({
      type: GameType.TRUE_OR_FALSE,
      lessonId: 'some-lesson-id',
      isPublished: false,
      order: 2,
    });
    expect(typeof games[1]?.id).toBe('string');
    expect(games[1]?.createdAt).toBeInstanceOf(Date);
    expect(games[1]?.updatedAt).toBeInstanceOf(Date);

    expect(storedGames[0]).toMatchObject({
      id: games[0]?.id,
      type: GameType.QCM,
      lessonId: 'some-lesson-id',
      isPublished: false,
      order: 1,
      createdAt: games[0]?.createdAt,
      updatedAt: games[0]?.updatedAt,
    });
    expect(storedGames[1]).toMatchObject({
      id: games[1]?.id,
      type: GameType.TRUE_OR_FALSE,
      lessonId: 'some-lesson-id',
      isPublished: false,
      order: 2,
      createdAt: games[1]?.createdAt,
      updatedAt: games[1]?.updatedAt,
    });
  });

  it('should return empty array if no games for lesson', async () => {
    // Given
    const command: getGamesByLessonIdCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'non-existent-lesson',
    };

    // When
    const games = await getGamesUseCase.execute(command);

    // Then
    expect(games).toMatchObject([]);
  });

  it('should only return games for the specified lesson', async () => {
    // Given
    const command: getGamesByLessonIdCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'other-lesson-id',
    };

    // When
    const games = await getGamesUseCase.execute(command);

    // Then
    expect(games.length).toBe(1);
    expect(games[0]?.type).toBe(GameType.MATCH_THE_WORD);
    expect(games[0]?.lessonId).toBe('other-lesson-id');
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
