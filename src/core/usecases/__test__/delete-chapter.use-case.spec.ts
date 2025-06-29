import { ChapterRepository } from '../../domain/repository/chapter.repository';
import { LessonRepository } from '../../domain/repository/lesson.repository';
import { GameRepository } from '../../domain/repository/game.repository';
import { InMemoryChapterRepository } from '../../../adapters/in-memory/in-memory-chapter.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { InMemoryGameRepository } from '../../../adapters/in-memory/in-memory-game.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  DeleteChapterCommand,
  DeleteChapterUseCase,
} from '../delete-chapter.use-case';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { ChapterNotFoundError } from '../../domain/error/ChapterNotFoundError';
import { GameType } from '../../domain/type/Game/GameType';
import { GameRules } from '../../domain/type/Game/GameRules';
import { Question } from '../../domain/type/Game/Question';
import { QcmQuestion } from '../../domain/type/Game/Questions/QCM';

describe('DeleteChapterUseCase', () => {
  let chapterRepository: ChapterRepository;
  let lessonRepository: LessonRepository;
  let gameRepository: GameRepository;
  let deleteChapterUseCase: DeleteChapterUseCase;

  beforeEach(async () => {
    chapterRepository = new InMemoryChapterRepository();
    lessonRepository = new InMemoryLessonRepository();
    gameRepository = new InMemoryGameRepository();
    deleteChapterUseCase = new DeleteChapterUseCase(
      chapterRepository,
      lessonRepository,
      gameRepository,
    );

    await chapterRepository.removeAll();
    await lessonRepository.removeAll();
    await gameRepository.removeAll();

    // Create a chapter
    await chapterRepository.create({
      id: 'chapter-id',
      title: 'Un chapitre',
      description: 'Ceci est un chapitre',
      isPublished: false,
    });

    // Create lessons associated with the chapter
    await lessonRepository.create({
      id: 'lesson-1',
      title: 'Première leçon',
      description: 'Ceci est la première leçon',
      chapterId: 'chapter-id',
      order: 1,
    });

    await lessonRepository.create({
      id: 'lesson-2',
      title: 'Deuxième leçon',
      description: 'Ceci est la deuxième leçon',
      chapterId: 'chapter-id',
      order: 2,
    });

    // Create games associated with the lessons
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

    // Games for lesson-1
    await gameRepository.create({
      id: 'game-1',
      type: GameType.QCM,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-1',
      order: 1,
    });

    await gameRepository.create({
      id: 'game-2',
      type: GameType.TRUE_OR_FALSE,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-1',
      order: 2,
    });

    // Games for lesson-2
    await gameRepository.create({
      id: 'game-3',
      type: GameType.QCM,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-2',
      order: 1,
    });
  });

  it('should delete chapter and associated lessons and games successfully', async () => {
    // GIVEN
    const command: DeleteChapterCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'chapter-id',
    };

    const initialChapters = await chapterRepository.findAll();
    const initialLessons = await lessonRepository.findAll();
    const initialGames = await gameRepository.findAll();
    expect(initialChapters.length).toEqual(1);
    expect(initialLessons.length).toEqual(2);
    expect(initialGames.length).toEqual(3);

    // WHEN
    await deleteChapterUseCase.execute(command);

    // THEN
    const chapters = await chapterRepository.findAll();
    const lessons = await lessonRepository.findAll();
    const games = await gameRepository.findAll();
    expect(chapters.length).toEqual(0);
    expect(lessons.length).toEqual(0);
    expect(games.length).toEqual(0);

    const deletedChapter = await chapterRepository.findById('chapter-id');
    expect(deletedChapter).toBeNull();

    const deletedLesson1 = await lessonRepository.findById('lesson-1');
    const deletedLesson2 = await lessonRepository.findById('lesson-2');
    expect(deletedLesson1).toBeNull();
    expect(deletedLesson2).toBeNull();

    const deletedGame1 = await gameRepository.findById('game-1');
    const deletedGame2 = await gameRepository.findById('game-2');
    const deletedGame3 = await gameRepository.findById('game-3');
    expect(deletedGame1).toBeNull();
    expect(deletedGame2).toBeNull();
    expect(deletedGame3).toBeNull();
  });

  it('should throw an error if user is not admin', async () => {
    // GIVEN
    const command: DeleteChapterCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      chapterId: 'chapter-id',
    };

    // WHEN & THEN
    await expect(deleteChapterUseCase.execute(command)).rejects.toThrow(
      UserNotAllowedError,
    );
    await expect(deleteChapterUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can delete chapters',
    );

    const chapters = await chapterRepository.findAll();
    const lessons = await lessonRepository.findAll();
    const games = await gameRepository.findAll();
    expect(chapters.length).toEqual(1);
    expect(lessons.length).toEqual(2);
    expect(games.length).toEqual(3);
  });

  it('should throw an error if chapter does not exist', async () => {
    // GIVEN
    const command: DeleteChapterCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'non-existing-chapter-id',
    };

    // WHEN & THEN
    await expect(deleteChapterUseCase.execute(command)).rejects.toThrow(
      ChapterNotFoundError,
    );
    await expect(deleteChapterUseCase.execute(command)).rejects.toThrow(
      'Chapter with id non-existing-chapter-id not found',
    );
  });

  it('should only delete lessons and games associated with the specific chapter', async () => {
    // GIVEN - Add another chapter with its own lesson and game
    await chapterRepository.create({
      id: 'chapter-2',
      title: 'Another chapter',
      description: 'Another chapter description',
      isPublished: true,
    });

    await lessonRepository.create({
      id: 'lesson-3',
      title: 'Lesson from another chapter',
      description: 'Lesson description',
      chapterId: 'chapter-2',
      order: 1,
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
      id: 'game-4',
      type: GameType.MATCH_THE_WORD,
      rules: mockRules,
      questions: mockQuestions,
      lessonId: 'lesson-3',
      order: 1,
    });

    // Verify initial state
    const initialChapters = await chapterRepository.findAll();
    const initialLessons = await lessonRepository.findAll();
    const initialGames = await gameRepository.findAll();
    expect(initialChapters.length).toEqual(2);
    expect(initialLessons.length).toEqual(3);
    expect(initialGames.length).toEqual(4);

    const command: DeleteChapterCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'chapter-id',
    };

    // WHEN
    await deleteChapterUseCase.execute(command);

    // THEN
    const chapters = await chapterRepository.findAll();
    const lessons = await lessonRepository.findAll();
    const games = await gameRepository.findAll();
    expect(chapters.length).toEqual(1);
    expect(lessons.length).toEqual(1);
    expect(games.length).toEqual(1);

    // Verify the remaining chapter, lesson and game
    expect(chapters[0]).toBeDefined();
    expect(lessons[0]).toBeDefined();
    expect(games[0]).toBeDefined();
    expect(chapters[0]?.id).toEqual('chapter-2');
    expect(lessons[0]?.id).toEqual('lesson-3');
    expect(lessons[0]?.chapterId).toEqual('chapter-2');
    expect(games[0]?.id).toEqual('game-4');
    expect(games[0]?.lessonId).toEqual('lesson-3');
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
