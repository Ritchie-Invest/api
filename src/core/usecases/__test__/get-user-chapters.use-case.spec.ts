import {
  GetUserChaptersUseCase,
  GetUserChaptersCommand,
} from '../get-user-chapters.use-case';
import { InMemoryChapterRepository } from '../../../adapters/in-memory/in-memory-chapter.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { InMemoryLessonCompletionRepository } from '../../../adapters/in-memory/in-memory-lesson-completion.repository';
import { GameType } from '../../domain/type/GameType';
import { McqModule } from '../../domain/model/McqModule';
import { GameChoice } from '../../domain/model/GameChoice';
import { LessonCompletion } from '../../domain/model/LessonCompletion';
import { ChapterStatus } from '../../domain/type/ChapterStatus';
import { LessonStatus } from '../../domain/type/LessonStatus';

describe('GetUserChaptersUseCase', () => {
  let useCase: GetUserChaptersUseCase;
  let chapterRepository: InMemoryChapterRepository;
  let lessonRepository: InMemoryLessonRepository;
  let gameModuleRepository: InMemoryGameModuleRepository;
  let lessonCompletionRepository: InMemoryLessonCompletionRepository;

  const userId = 'user-123';

  const createMcqModule = (id: string, lessonId: string) => {
    const correctChoice = new GameChoice({
      id: `${id}-choice-1`,
      text: 'Paris',
      isCorrect: true,
      correctionMessage: 'Correct!',
    });

    const incorrectChoice = new GameChoice({
      id: `${id}-choice-2`,
      text: 'Lyon',
      isCorrect: false,
      correctionMessage: 'Incorrect.',
    });

    return new McqModule({
      id,
      lessonId,
      question: 'What is the capital of France?',
      choices: [correctChoice, incorrectChoice],
    });
  };

  const createPublishedChapter = (
    id: string,
    title: string,
    description: string,
    order: number,
  ) => {
    const chapter = chapterRepository.create({ id, title, description, order });
    chapter.isPublished = true;
    return chapter;
  };

  const createPublishedLesson = (
    id: string,
    chapterId: string,
    title: string,
    description: string,
    order: number,
  ) => {
    const lesson = lessonRepository.create({
      id,
      chapterId,
      title,
      description,
      order,
      gameType: GameType.MCQ,
      modules: [],
    });
    lesson.isPublished = true;
    return lesson;
  };

  beforeEach(() => {
    lessonRepository = new InMemoryLessonRepository();
    gameModuleRepository = new InMemoryGameModuleRepository();
    lessonCompletionRepository = new InMemoryLessonCompletionRepository();
    chapterRepository = new InMemoryChapterRepository(
      lessonRepository,
      gameModuleRepository,
      lessonCompletionRepository,
    );

    useCase = new GetUserChaptersUseCase(chapterRepository);
  });

  afterEach(() => {
    chapterRepository.removeAll();
    lessonRepository.removeAll();
    gameModuleRepository.removeAll();
    lessonCompletionRepository.removeAll();
  });

  it('should throw an error when userId is missing', async () => {
    // Given
    const command: GetUserChaptersCommand = { userId: '' };

    // When & Then
    await expect(useCase.execute(command)).rejects.toThrow(
      'User ID is required',
    );
  });

  it('should return an empty array when there are no chapters', async () => {
    // Given
    const command: GetUserChaptersCommand = { userId };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result).toEqual([]);
  });

  it('should return published chapters with no lessons', async () => {
    // Given
    createPublishedChapter('chapter-1', 'Chapter 1', 'First chapter', 1);
    createPublishedChapter('chapter-2', 'Chapter 2', 'Second chapter', 2);
    const command: GetUserChaptersCommand = { userId };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'chapter-1',
      title: 'Chapter 1',
      description: 'First chapter',
      order: 1,
      status: ChapterStatus.COMPLETED,
      completedLessons: 0,
      totalLessons: 0,
      lessons: [],
    });
    expect(result[1]).toMatchObject({
      id: 'chapter-2',
      title: 'Chapter 2',
      description: 'Second chapter',
      order: 2,
      status: ChapterStatus.COMPLETED,
      completedLessons: 0,
      totalLessons: 0,
      lessons: [],
    });
  });

  it('should return a chapter with an unlocked uncompleted lesson', async () => {
    // Given
    createPublishedChapter('chapter-1', 'Chapter 1', 'First chapter', 1);
    const lesson = createPublishedLesson(
      'lesson-1',
      'chapter-1',
      'Lesson 1',
      'First lesson',
      1,
    );
    const command: GetUserChaptersCommand = { userId };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'chapter-1',
      status: ChapterStatus.UNLOCKED,
      completedLessons: 0,
      totalLessons: 1,
    });
    expect(result[0]!.lessons[0]).toMatchObject({
      id: lesson.id,
      status: LessonStatus.UNLOCKED,
    });
  });

  it('should count completed lessons and set chapter IN_PROGRESS', async () => {
    // Given
    createPublishedChapter('chapter-1', 'Chapter 1', 'First chapter', 1);
    const lesson1 = createPublishedLesson(
      'lesson-1',
      'chapter-1',
      'Lesson 1',
      'First lesson',
      1,
    );
    const lesson2 = createPublishedLesson(
      'lesson-2',
      'chapter-1',
      'Lesson 2',
      'Second lesson',
      2,
    );
    lessonCompletionRepository.create(
      new LessonCompletion('completion-1', userId, lesson1.id, 100, new Date()),
    );
    const command: GetUserChaptersCommand = { userId };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'chapter-1',
      status: ChapterStatus.IN_PROGRESS,
      completedLessons: 1,
      totalLessons: 2,
    });
    const lessonSummary1 = result[0]!.lessons.find((l) => l.id === lesson1.id)!;
    const lessonSummary2 = result[0]!.lessons.find((l) => l.id === lesson2.id)!;
    expect(lessonSummary1.status).toBe(LessonStatus.COMPLETED);
    expect(lessonSummary2.status).toBe(LessonStatus.UNLOCKED);
  });

  it('should lock a chapter while previous is not completed', async () => {
    // Given
    createPublishedChapter('chapter-1', 'Chapter 1', 'First chapter', 1);
    createPublishedChapter('chapter-2', 'Chapter 2', 'Second chapter', 2);
    createPublishedLesson(
      'lesson-1',
      'chapter-1',
      'Lesson 1',
      'First lesson',
      1,
    );
    createPublishedLesson(
      'lesson-2',
      'chapter-2',
      'Lesson 2',
      'First lesson chapter 2',
      1,
    );
    const command: GetUserChaptersCommand = { userId };

    // When
    const result = await useCase.execute(command);

    // Then
    const chapter1 = result.find((c) => c.id === 'chapter-1')!;
    expect(chapter1.status).toBe(ChapterStatus.UNLOCKED);
    expect(chapter1.lessons[0]!.status).toBe(LessonStatus.UNLOCKED);
    expect(chapter1.totalLessons).toBe(1);
    const chapter2 = result.find((c) => c.id === 'chapter-2')!;
    expect(chapter2.status).toBe(ChapterStatus.LOCKED);
    expect(chapter2.lessons[0]!.status).toBe(LessonStatus.LOCKED);
    expect(chapter2.totalLessons).toBe(1);
  });

  it('should unlock second chapter when first is completed', async () => {
    // Given
    createPublishedChapter('chapter-1', 'Chapter 1', 'First chapter', 1);
    createPublishedChapter('chapter-2', 'Chapter 2', 'Second chapter', 2);
    const lesson1 = createPublishedLesson(
      'lesson-1',
      'chapter-1',
      'Lesson 1',
      'First lesson',
      1,
    );
    const lesson2_1 = createPublishedLesson(
      'lesson-2-1',
      'chapter-2',
      'Lesson 1 Ch2',
      'First lesson ch2',
      1,
    );
    lessonCompletionRepository.create(
      new LessonCompletion('completion-1', userId, lesson1.id, 80, new Date()),
    );
    const command: GetUserChaptersCommand = { userId };

    // When
    const result = await useCase.execute(command);

    // Then
    const chapter1 = result.find((c) => c.id === 'chapter-1')!;
    const chapter2 = result.find((c) => c.id === 'chapter-2')!;
    expect(chapter1.status).toBe(ChapterStatus.COMPLETED);
    expect(chapter2.status).toBe(ChapterStatus.UNLOCKED);
    expect(chapter2.lessons.find((l) => l.id === lesson2_1.id)!.status).toBe(
      LessonStatus.UNLOCKED,
    );
  });

  it('should set chapter COMPLETED when all lessons are completed', async () => {
    // Given
    createPublishedChapter('chapter-1', 'Chapter 1', 'First chapter', 1);
    const lesson1 = createPublishedLesson(
      'lesson-1',
      'chapter-1',
      'Lesson 1',
      'First lesson',
      1,
    );
    const lesson2 = createPublishedLesson(
      'lesson-2',
      'chapter-1',
      'Lesson 2',
      'Second lesson',
      2,
    );
    lessonCompletionRepository.create(
      new LessonCompletion('completion-1', userId, lesson1.id, 90, new Date()),
    );
    lessonCompletionRepository.create(
      new LessonCompletion('completion-2', userId, lesson2.id, 95, new Date()),
    );
    const command: GetUserChaptersCommand = { userId };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result[0]!.status).toBe(ChapterStatus.COMPLETED);
    expect(result[0]!.completedLessons).toBe(2);
    expect(result[0]!.totalLessons).toBe(2);
    expect(result[0]!.lessons.map((l) => l.status)).toEqual([
      LessonStatus.COMPLETED,
      LessonStatus.COMPLETED,
    ]);
  });

  it('should set gameModuleId to the first module of the lesson', async () => {
    // Given
    createPublishedChapter('chapter-1', 'Chapter 1', 'First chapter', 1);
    const lesson1 = createPublishedLesson(
      'lesson-1',
      'chapter-1',
      'Lesson 1',
      'First lesson',
      1,
    );
    const lesson2 = createPublishedLesson(
      'lesson-2',
      'chapter-1',
      'Lesson 2',
      'Second lesson',
      2,
    );

    const module1 = createMcqModule('module-1', lesson1.id);
    const module2 = createMcqModule('module-2', lesson1.id);
    const module3 = createMcqModule('module-3', lesson2.id);
    gameModuleRepository.create(module1);
    gameModuleRepository.create(module2);
    gameModuleRepository.create(module3);
    lessonCompletionRepository.create(
      new LessonCompletion('completion-1', userId, lesson1.id, 100, new Date()),
    );
    const command: GetUserChaptersCommand = { userId };

    // When
    const result = await useCase.execute(command);

    // Then
    const lessonSummary1 = result[0]!.lessons.find((l) => l.id === lesson1.id)!;
    expect(lessonSummary1.gameModuleId).toBe('module-1');
    const lessonSummary2 = result[0]!.lessons.find((l) => l.id === lesson2.id)!;
    expect(lessonSummary2.gameModuleId).toBe('module-3');
  });
});
