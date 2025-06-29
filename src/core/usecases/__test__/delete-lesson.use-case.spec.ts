import { LessonRepository } from '../../domain/repository/lesson.repository';
import { GameRepository } from '../../domain/repository/game.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { InMemoryGameRepository } from '../../../adapters/in-memory/in-memory-game.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  DeleteLessonCommand,
  DeleteLessonUseCase,
} from '../delete-lesson.use-case';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { LessonNotFoundError } from '../../domain/error/LessonNotFoundError';
import { GameType } from '../../domain/type/Game/GameType';
import { GameRules } from '../../domain/type/Game/GameRules';
import { Question } from '../../domain/type/Game/Question';
import { QcmQuestion } from '../../domain/type/Game/Questions/QCM';

describe('DeleteLessonUseCase', () => {
  let lessonRepository: LessonRepository;
  let gameRepository: GameRepository;
  let deleteLessonUseCase: DeleteLessonUseCase;

  beforeEach(async () => {
    lessonRepository = new InMemoryLessonRepository();
    gameRepository = new InMemoryGameRepository();
    deleteLessonUseCase = new DeleteLessonUseCase(lessonRepository, gameRepository);

    await lessonRepository.removeAll();
    await gameRepository.removeAll();
    
    // Create a lesson
    await lessonRepository.create({
      id: 'lesson-id',
      title: 'Une leçon',
      description: 'Ceci est une leçon',
      chapterId: 'chapter-1',
      order: 1,
    });

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
      id: 'game-1',
      type: GameType.QCM,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-id',
      order: 1,
    });

    await gameRepository.create({
      id: 'game-2',
      type: GameType.TRUE_OR_FALSE,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-id',
      order: 2,
    });
  });

  it('should delete lesson and associated games successfully', async () => {
    // GIVEN
    const command: DeleteLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
    };

    const initialLessons = await lessonRepository.findAll();
    const initialGames = await gameRepository.findAll();
    expect(initialLessons.length).toEqual(1);
    expect(initialGames.length).toEqual(2);

    // WHEN
    await deleteLessonUseCase.execute(command);

    // THEN
    const lessons = await lessonRepository.findAll();
    const games = await gameRepository.findAll();
    expect(lessons.length).toEqual(0);
    expect(games.length).toEqual(0);
    
    const deletedLesson = await lessonRepository.findById('lesson-id');
    expect(deletedLesson).toBeNull();
    
    const deletedGame1 = await gameRepository.findById('game-1');
    const deletedGame2 = await gameRepository.findById('game-2');
    expect(deletedGame1).toBeNull();
    expect(deletedGame2).toBeNull();
  });

  it('should throw an error if user is not admin', async () => {
    // GIVEN
    const command: DeleteLessonCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      lessonId: 'lesson-id',
    };

    // WHEN & THEN
    await expect(deleteLessonUseCase.execute(command)).rejects.toThrow(
      UserNotAllowedError,
    );
    await expect(deleteLessonUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can delete lessons',
    );

    // Lesson and games should still exist
    const lessons = await lessonRepository.findAll();
    const games = await gameRepository.findAll();
    expect(lessons.length).toEqual(1);
    expect(games.length).toEqual(2);
  });

  it('should throw an error if lesson does not exist', async () => {
    // GIVEN
    const command: DeleteLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'non-existing-lesson-id',
    };

    // WHEN & THEN
    await expect(deleteLessonUseCase.execute(command)).rejects.toThrow(
      LessonNotFoundError,
    );
    await expect(deleteLessonUseCase.execute(command)).rejects.toThrow(
      'Lesson with id non-existing-lesson-id not found',
    );
  });

  it('should only delete games associated with the specific lesson', async () => {
    // GIVEN - Add another lesson with its own game
    await lessonRepository.create({
      id: 'lesson-2',
      title: 'Another lesson',
      description: 'Another lesson description',
      chapterId: 'chapter-1',
      order: 2,
    });

    const mockRules: GameRules = {
      shuffle_questions: true,
      time_limit_seconds: 30,
    };

    const mockQuestions: Question[] = [
      {
        question: 'Another question?',
        options: [
          { value: 'Maybe', is_valid: true },
          { value: 'Never', is_valid: false },
        ],
        feedback: 'The correct answer is Maybe',
      } as QcmQuestion,
    ];

    await gameRepository.create({
      id: 'game-3',
      type: GameType.MATCH_THE_WORD,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-2',
      order: 1,
    });

    // Verify initial state
    const initialLessons = await lessonRepository.findAll();
    const initialGames = await gameRepository.findAll();
    expect(initialLessons.length).toEqual(2);
    expect(initialGames.length).toEqual(3);

    const command: DeleteLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
    };

    // WHEN
    await deleteLessonUseCase.execute(command);

    // THEN
    const lessons = await lessonRepository.findAll();
    const games = await gameRepository.findAll();
    expect(lessons.length).toEqual(1);
    expect(games.length).toEqual(1);
    
    // Verify the remaining lesson and game
    expect(lessons[0]).toBeDefined();
    expect(games[0]).toBeDefined();
    expect(lessons[0]?.id).toEqual('lesson-2');
    expect(games[0]?.id).toEqual('game-3');
    expect(games[0]?.lessonId).toEqual('lesson-2');
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
