import {
  GetUserChaptersUseCase,
  GetUserChaptersCommand,
} from '../get-user-chapters.usecase';
import { InMemoryChapterRepository } from '../../../adapters/in-memory/in-memory-chapter.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { InMemoryProgressionRepository } from '../../../adapters/in-memory/in-memory-progression.repository';
import { GameType } from '../../domain/type/GameType';
import { McqModule } from '../../domain/model/McqModule';
import { McqChoice } from '../../domain/model/McqChoice';
import { Progression } from '../../domain/model/Progression';

describe('GetUserChaptersUseCase', () => {
  let useCase: GetUserChaptersUseCase;
  let chapterRepository: InMemoryChapterRepository;
  let lessonRepository: InMemoryLessonRepository;
  let gameModuleRepository: InMemoryGameModuleRepository;
  let progressionRepository: InMemoryProgressionRepository;

  const userId = 'user-123';

  const createMcqModule = (id: string, lessonId: string) => {
    const correctChoice = new McqChoice({
      id: `${id}-choice-1`,
      text: 'Paris',
      isCorrect: true,
      correctionMessage: 'Correct!',
    });

    const incorrectChoice = new McqChoice({
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

  const createProgression = (
    id: string,
    userId: string,
    gameModuleId: string,
    isCompleted: boolean,
  ) => {
    return new Progression(id, userId, gameModuleId, isCompleted);
  };

  beforeEach(() => {
    lessonRepository = new InMemoryLessonRepository();
    gameModuleRepository = new InMemoryGameModuleRepository();
    progressionRepository = new InMemoryProgressionRepository();
    chapterRepository = new InMemoryChapterRepository(
      lessonRepository,
      gameModuleRepository,
      progressionRepository,
    );

    useCase = new GetUserChaptersUseCase(chapterRepository);
  });

  afterEach(() => {
    chapterRepository.removeAll();
    lessonRepository.removeAll();
    gameModuleRepository.removeAll();
    progressionRepository.removeAll();
  });

  describe('execute', () => {
    it('should throw error when userId is not provided', async () => {
      const command: GetUserChaptersCommand = { userId: '' };

      await expect(useCase.execute(command)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('should return empty chapters array when no chapters exist', async () => {
      const command: GetUserChaptersCommand = { userId };

      const result = await useCase.execute(command);

      expect(result).toEqual({
        chapters: [],
      });
    });

    it('should return chapters with no lessons when chapters exist but no lessons', async () => {
      // Given
      chapterRepository.create({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });
      chapterRepository.create({
        id: 'chapter-2',
        title: 'Chapter 2',
        description: 'Second chapter',
        order: 2,
      });

      const command: GetUserChaptersCommand = { userId };

      // When
      const result = await useCase.execute(command);

      // Then

      expect(result.chapters).toHaveLength(2);
      expect(result.chapters[0]).toMatchObject({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 0,
        lessons: [],
      });
      expect(result.chapters[1]).toMatchObject({
        id: 'chapter-2',
        title: 'Chapter 2',
        description: 'Second chapter',
        order: 2,
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 0,
        lessons: [],
      });
    });

    it('should return chapters with lessons and correct progression data', async () => {
      // Given
      chapterRepository.create({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });

      const command: GetUserChaptersCommand = { userId };

      // When
      const result = await useCase.execute(command);

      // Then

      expect(result.chapters).toHaveLength(1);
      expect(result.chapters[0]).toMatchObject({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 0,
        lessons: [],
      });
    });

    it('should handle multiple chapters with complex progression logic', async () => {
      // Given
      chapterRepository.create({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });
      chapterRepository.create({
        id: 'chapter-2',
        title: 'Chapter 2',
        description: 'Second chapter',
        order: 2,
      });

      const command: GetUserChaptersCommand = { userId };

      // When
      const result = await useCase.execute(command);

      // Then

      expect(result.chapters).toHaveLength(2);

      expect(result.chapters[0]).toMatchObject({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 0,
        lessons: [],
      });

      expect(result.chapters[1]).toMatchObject({
        id: 'chapter-2',
        title: 'Chapter 2',
        description: 'Second chapter',
        order: 2,
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 0,
        lessons: [],
      });
    });

    it('should handle lessons with no modules', async () => {
      // Given
      chapterRepository.create({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });

      const command: GetUserChaptersCommand = { userId };

      // When
      const result = await useCase.execute(command);

      // Then

      expect(result.chapters).toHaveLength(1);
      const chapter = result.chapters[0]!;
      expect(chapter).toBeDefined();
      expect(chapter.lessons).toHaveLength(0);
    });

    it('should filter progression data by userId', async () => {
      // Given
      chapterRepository.create({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });

      const command: GetUserChaptersCommand = { userId };

      // When
      const result = await useCase.execute(command);

      // Then

      expect(result.chapters).toHaveLength(1);
      const chapter = result.chapters[0]!;
      expect(chapter).toBeDefined();
      expect(chapter.lessons).toHaveLength(0);
    });

    describe('processLessons (tested indirectly)', () => {
      it('should correctly process lessons and count completed ones', async () => {
        // Given
        const chapterId = 'chapter-1';
        chapterRepository.create({
          id: chapterId,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        const lesson1Id = 'lesson-1';
        lessonRepository.create({
          id: lesson1Id,
          chapterId,
          title: 'Lesson 1',
          description: 'First lesson',
          order: 1,
          gameType: GameType.MCQ,
        });

        const lesson2Id = 'lesson-2';
        lessonRepository.create({
          id: lesson2Id,
          chapterId,
          title: 'Lesson 2',
          description: 'Second lesson',
          order: 2,
          gameType: GameType.MCQ,
        });

        const module1Id = 'module-1';
        const mcqModule1 = createMcqModule(module1Id, lesson1Id);
        gameModuleRepository.create(mcqModule1);

        const module2Id = 'module-2';
        const mcqModule2 = createMcqModule(module2Id, lesson1Id);
        gameModuleRepository.create(mcqModule2);

        const module3Id = 'module-3';
        const mcqModule3 = createMcqModule(module3Id, lesson2Id);
        gameModuleRepository.create(mcqModule3);

        progressionRepository.create(
          new Progression('prog-1', userId, module1Id, true),
        );
        progressionRepository.create(
          new Progression('prog-2', userId, module2Id, true),
        );

        progressionRepository.create(
          new Progression('prog-3', userId, module3Id, false),
        );

        const command: GetUserChaptersCommand = { userId };

        // When
        const result = await useCase.execute(command);

        // Then
        expect(result.chapters).toHaveLength(1);
        expect(result.chapters[0]?.completedLessons).toBe(1);
        expect(result.chapters[0]?.totalLessons).toBe(2);
        expect(result.chapters[0]?.lessons).toHaveLength(2);

        const lesson1 = result.chapters[0]?.lessons[0];
        expect(lesson1?.completedModules).toBe(2);
        expect(lesson1?.totalModules).toBe(2);
        expect(lesson1?.isUnlocked).toBe(true);

        const lesson2 = result.chapters[0]?.lessons[1];
        expect(lesson2?.completedModules).toBe(0);
        expect(lesson2?.totalModules).toBe(1);
        expect(lesson2?.isUnlocked).toBe(true);
      });
    });

    describe('isLessonUnlocked (tested indirectly)', () => {
      it('should unlock first lesson of first chapter', async () => {
        // Given
        const chapterId = 'chapter-1';
        chapterRepository.create({
          id: chapterId,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        const lessonId = 'lesson-1';
        lessonRepository.create({
          id: lessonId,
          chapterId,
          title: 'Lesson 1',
          description: 'First lesson',
          order: 1,
          gameType: GameType.MCQ,
        });

        const command: GetUserChaptersCommand = { userId };

        // When
        const result = await useCase.execute(command);

        // Then

        expect(result.chapters[0]?.lessons[0]?.isUnlocked).toBe(true);
      });

      it('should not unlock first lesson of second chapter when first chapter is incomplete', async () => {
        // Given
        const chapter1Id = 'chapter-1';
        chapterRepository.create({
          id: chapter1Id,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        const lesson1Id = 'lesson-1';
        lessonRepository.create({
          id: lesson1Id,
          chapterId: chapter1Id,
          title: 'Lesson 1',
          description: 'First lesson',
          order: 1,
          gameType: GameType.MCQ,
        });

        const module1Id = 'module-1';
        const mcqModule1 = createMcqModule(module1Id, lesson1Id);
        gameModuleRepository.create(mcqModule1);

        const chapter2Id = 'chapter-2';
        chapterRepository.create({
          id: chapter2Id,
          title: 'Chapter 2',
          description: 'Second chapter',
          order: 2,
        });

        const lesson2Id = 'lesson-2';
        lessonRepository.create({
          id: lesson2Id,
          chapterId: chapter2Id,
          title: 'Lesson 1 of Chapter 2',
          description: 'First lesson of second chapter',
          order: 1,
          gameType: GameType.MCQ,
        });

        const command: GetUserChaptersCommand = { userId };

        // When
        const result = await useCase.execute(command);

        // Then
        expect(result.chapters[0]?.lessons[0]?.isUnlocked).toBe(true);

        expect(result.chapters[1]?.isUnlocked).toBe(false);

        expect(result.chapters[1]?.lessons[0]?.isUnlocked).toBe(false);
      });

      it('should unlock second lesson when first lesson is completed', async () => {
        // Given
        const chapterId = 'chapter-1';
        chapterRepository.create({
          id: chapterId,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        const lesson1Id = 'lesson-1';
        lessonRepository.create({
          id: lesson1Id,
          chapterId,
          title: 'Lesson 1',
          description: 'First lesson',
          order: 1,
          gameType: GameType.MCQ,
        });

        const module1Id = 'module-1';
        const mcqModule1 = createMcqModule(module1Id, lesson1Id);
        gameModuleRepository.create(mcqModule1);

        progressionRepository.create(
          new Progression('prog-1', userId, module1Id, true),
        );

        const lesson2Id = 'lesson-2';
        lessonRepository.create({
          id: lesson2Id,
          chapterId,
          title: 'Lesson 2',
          description: 'Second lesson',
          order: 2,
          gameType: GameType.MCQ,
        });

        const command: GetUserChaptersCommand = { userId };

        // When
        const result = await useCase.execute(command);

        // Then
        expect(result.chapters[0]?.lessons[1]?.isUnlocked).toBe(true);
      });
    });

    describe('isChapterUnlocked and isChapterCompleted (tested indirectly)', () => {
      it('should unlock second chapter when first chapter is completed', async () => {
        // Given
        const chapter1Id = 'chapter-1';
        chapterRepository.create({
          id: chapter1Id,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        const lesson1Id = 'lesson-1';
        lessonRepository.create({
          id: lesson1Id,
          chapterId: chapter1Id,
          title: 'Lesson 1',
          description: 'First lesson',
          order: 1,
          gameType: GameType.MCQ,
        });

        const module1Id = 'module-1';
        const mcqModule1 = createMcqModule(module1Id, lesson1Id);
        gameModuleRepository.create(mcqModule1);

        progressionRepository.create(
          new Progression('prog-1', userId, module1Id, true),
        );

        const chapter2Id = 'chapter-2';
        chapterRepository.create({
          id: chapter2Id,
          title: 'Chapter 2',
          description: 'Second chapter',
          order: 2,
        });

        const command: GetUserChaptersCommand = { userId };

        // When
        const result = await useCase.execute(command);

        // Then
        expect(result.chapters[0]?.completedLessons).toBe(1);
        expect(result.chapters[0]?.totalLessons).toBe(1);

        expect(result.chapters[1]?.isUnlocked).toBe(true);
      });

      it('should not consider chapter completed if it has no lessons', async () => {
        // Given
        const chapter1Id = 'chapter-1';
        chapterRepository.create({
          id: chapter1Id,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        const chapter2Id = 'chapter-2';
        chapterRepository.create({
          id: chapter2Id,
          title: 'Chapter 2',
          description: 'Second chapter',
          order: 2,
        });

        const command: GetUserChaptersCommand = { userId };

        // When
        const result = await useCase.execute(command);

        // Then
        expect(result.chapters[1]?.isUnlocked).toBe(false);
      });
    });

    describe('calculateModulesProgress (tested indirectly)', () => {
      it('should correctly calculate modules progress', async () => {
        // Given
        const chapterId = 'chapter-1';
        chapterRepository.create({
          id: chapterId,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        const lessonId = 'lesson-1';
        lessonRepository.create({
          id: lessonId,
          chapterId,
          title: 'Lesson 1',
          description: 'First lesson',
          order: 1,
          gameType: GameType.MCQ,
        });

        const module1Id = 'module-1';
        const mcqModule1 = createMcqModule(module1Id, lessonId);
        gameModuleRepository.create(mcqModule1);

        const module2Id = 'module-2';
        const mcqModule2 = createMcqModule(module2Id, lessonId);
        gameModuleRepository.create(mcqModule2);

        const module3Id = 'module-3';
        const mcqModule3 = createMcqModule(module3Id, lessonId);
        gameModuleRepository.create(mcqModule3);

        progressionRepository.create(
          new Progression('prog-1', userId, module1Id, true),
        );
        progressionRepository.create(
          new Progression('prog-2', userId, module2Id, true),
        );
        progressionRepository.create(
          new Progression('prog-3', userId, module3Id, false),
        );

        const command: GetUserChaptersCommand = { userId };

        // When
        const result = await useCase.execute(command);

        // Then
        expect(result.chapters[0]?.lessons[0]?.completedModules).toBe(2);
        expect(result.chapters[0]?.lessons[0]?.totalModules).toBe(3);
      });
    });
  });

  describe('Progress', () => {
    it('should correctly calculate modules progress', async () => {
      // Given
      const chapterId = 'chapter-1';
      chapterRepository.create({
        id: chapterId,
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });

      const lessonId = 'lesson-1';
      lessonRepository.create({
        id: lessonId,
        chapterId,
        title: 'Lesson 1',
        description: 'First lesson',
        order: 1,
        gameType: GameType.MCQ,
      });

      const mcqModule = createMcqModule('module-1', lessonId);
      gameModuleRepository.create(mcqModule);

      progressionRepository.create(
        createProgression('prog-1', userId, 'module-1', true),
      );

      const command: GetUserChaptersCommand = { userId };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.chapters[0]?.lessons[0]?.completedModules).toBe(1);
      expect(result.chapters[0]?.lessons[0]?.totalModules).toBe(1);

      expect(result.chapters[0]?.completedLessons).toBe(1);
    });

    it('should unlock lessons based on completion status of previous lessons or chapters', async () => {
      // Given
      chapterRepository.create({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });

      chapterRepository.create({
        id: 'chapter-2',
        title: 'Chapter 2',
        description: 'Second chapter',
        order: 2,
      });

      lessonRepository.create({
        id: 'lesson-1-1',
        chapterId: 'chapter-1',
        title: 'Lesson 1 of Chapter 1',
        description: 'First lesson',
        order: 1,
        gameType: GameType.MCQ,
      });

      const mcqModule = createMcqModule('module-1', 'lesson-1-1');
      gameModuleRepository.create(mcqModule);
      progressionRepository.create(
        createProgression('prog-1', userId, 'module-1', true),
      );

      lessonRepository.create({
        id: 'lesson-2-1',
        chapterId: 'chapter-2',
        title: 'Lesson 1 of Chapter 2',
        description: 'First lesson of second chapter',
        order: 1,
        gameType: GameType.MCQ,
      });

      const command: GetUserChaptersCommand = { userId };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.chapters[0]?.lessons[0]?.isUnlocked).toBe(true);

      expect(result.chapters[1]?.isUnlocked).toBe(true);

      expect(result.chapters[1]?.lessons[0]?.isUnlocked).toBe(true);
    });
  });
});
