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

  // Helper functions for creating test objects
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
    chapterRepository = new InMemoryChapterRepository();
    lessonRepository = new InMemoryLessonRepository();
    gameModuleRepository = new InMemoryGameModuleRepository();
    progressionRepository = new InMemoryProgressionRepository();

    // Configure les dépendances pour le repository de chapitres
    chapterRepository.setDependencies(
      lessonRepository,
      gameModuleRepository,
      progressionRepository,
    );

    useCase = new GetUserChaptersUseCase(
      chapterRepository,
      lessonRepository,
      gameModuleRepository,
      progressionRepository,
    );
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
      // Setup
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

      const result = await useCase.execute(command);

      expect(result.chapters).toHaveLength(2);
      expect(result.chapters[0]).toEqual({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
        is_unlocked: true,
        completed_lessons: 0,
        total_lessons: 0,
        lessons: [],
      });
      expect(result.chapters[1]).toEqual({
        id: 'chapter-2',
        title: 'Chapter 2',
        description: 'Second chapter',
        order: 2,
        is_unlocked: false,
        completed_lessons: 0,
        total_lessons: 0,
        lessons: [],
      });
    });

    it('should return chapters with lessons and correct progression data', async () => {
      // Setup chapters
      chapterRepository.create({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });

      const command: GetUserChaptersCommand = { userId };

      const result = await useCase.execute(command);

      expect(result.chapters).toHaveLength(1);
      expect(result.chapters[0]).toEqual({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
        is_unlocked: true,
        completed_lessons: 0,
        total_lessons: 0,
        lessons: [],
      });
    });

    it('should handle multiple chapters with complex progression logic', async () => {
      // Setup chapters
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

      const result = await useCase.execute(command);

      expect(result.chapters).toHaveLength(2);

      expect(result.chapters[0]).toEqual({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
        is_unlocked: true,
        completed_lessons: 0,
        total_lessons: 0,
        lessons: [],
      });

      expect(result.chapters[1]).toEqual({
        id: 'chapter-2',
        title: 'Chapter 2',
        description: 'Second chapter',
        order: 2,
        is_unlocked: false,
        completed_lessons: 0,
        total_lessons: 0,
        lessons: [],
      });
    });

    it('should handle lessons with no modules', async () => {
      // Setup
      chapterRepository.create({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });

      const command: GetUserChaptersCommand = { userId };

      const result = await useCase.execute(command);

      expect(result.chapters).toHaveLength(1);
      const chapter = result.chapters[0]!;
      expect(chapter).toBeDefined();
      expect(chapter.lessons).toHaveLength(0);
    });

    it('should filter progression data by userId', async () => {
      // Setup
      chapterRepository.create({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
      });

      const command: GetUserChaptersCommand = { userId };

      const result = await useCase.execute(command);

      expect(result.chapters).toHaveLength(1);
      const chapter = result.chapters[0]!;
      expect(chapter).toBeDefined();
      expect(chapter.lessons).toHaveLength(0);
    });

    // Tests pour les méthodes privées
    describe('processLessons (tested indirectly)', () => {
      it('should correctly process lessons and count completed ones', async () => {
        // Setup chapter with lessons and modules
        const chapterId = 'chapter-1';
        chapterRepository.create({
          id: chapterId,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        // Add two lessons to the chapter
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

        // Add modules to lessons
        const module1Id = 'module-1';
        const mcqModule1 = createMcqModule(module1Id, lesson1Id);
        gameModuleRepository.create(mcqModule1);

        const module2Id = 'module-2';
        const mcqModule2 = createMcqModule(module2Id, lesson1Id);
        gameModuleRepository.create(mcqModule2);

        const module3Id = 'module-3';
        const mcqModule3 = createMcqModule(module3Id, lesson2Id);
        gameModuleRepository.create(mcqModule3);

        // Complete all modules in lesson 1
        progressionRepository.create(
          new Progression('prog-1', userId, module1Id, true),
        );
        progressionRepository.create(
          new Progression('prog-2', userId, module2Id, true),
        );

        // Mark module in lesson 2 as incomplete
        progressionRepository.create(
          new Progression('prog-3', userId, module3Id, false),
        );

        const command: GetUserChaptersCommand = { userId };
        const result = await useCase.execute(command);

        // Verify the result
        expect(result.chapters).toHaveLength(1);
        expect(result.chapters[0]?.completed_lessons).toBe(1);
        expect(result.chapters[0]?.total_lessons).toBe(2);
        expect(result.chapters[0]?.lessons).toHaveLength(2);

        // Verify lesson 1 is completed
        const lesson1 = result.chapters[0]?.lessons[0];
        expect(lesson1?.completed_modules).toBe(2);
        expect(lesson1?.total_modules).toBe(2);
        expect(lesson1?.is_unlocked).toBe(true);

        // Verify lesson 2 is unlocked but not completed
        const lesson2 = result.chapters[0]?.lessons[1];
        expect(lesson2?.completed_modules).toBe(0);
        expect(lesson2?.total_modules).toBe(1);
        expect(lesson2?.is_unlocked).toBe(true);
      });
    });

    describe('isLessonUnlocked (tested indirectly)', () => {
      it('should unlock first lesson of first chapter', async () => {
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
        const result = await useCase.execute(command);

        expect(result.chapters[0]?.lessons[0]?.is_unlocked).toBe(true);
      });

      it('should not unlock first lesson of second chapter when first chapter is incomplete', async () => {
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
        const result = await useCase.execute(command);

        // First chapter's lesson should be unlocked
        expect(result.chapters[0]?.lessons[0]?.is_unlocked).toBe(true);

        // Second chapter should be locked
        expect(result.chapters[1]?.is_unlocked).toBe(false);

        // Second chapter's first lesson should be locked
        expect(result.chapters[1]?.lessons[0]?.is_unlocked).toBe(false);
      });

      it('should unlock second lesson when first lesson is completed', async () => {
        const chapterId = 'chapter-1';
        chapterRepository.create({
          id: chapterId,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        // First lesson with completed module
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

        // Complete the module
        progressionRepository.create(
          new Progression('prog-1', userId, module1Id, true),
        );

        // Second lesson
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
        const result = await useCase.execute(command);

        // Second lesson should be unlocked because first is completed
        expect(result.chapters[0]?.lessons[1]?.is_unlocked).toBe(true);
      });
    });

    describe('isChapterUnlocked and isChapterCompleted (tested indirectly)', () => {
      it('should unlock second chapter when first chapter is completed', async () => {
        // First chapter with completed lesson
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

        // Complete the module
        progressionRepository.create(
          new Progression('prog-1', userId, module1Id, true),
        );

        // Second chapter
        const chapter2Id = 'chapter-2';
        chapterRepository.create({
          id: chapter2Id,
          title: 'Chapter 2',
          description: 'Second chapter',
          order: 2,
        });

        const command: GetUserChaptersCommand = { userId };
        const result = await useCase.execute(command);

        // First chapter should be completed
        expect(result.chapters[0]?.completed_lessons).toBe(1);
        expect(result.chapters[0]?.total_lessons).toBe(1);

        // Second chapter should be unlocked
        expect(result.chapters[1]?.is_unlocked).toBe(true);
      });

      it('should not consider chapter completed if it has no lessons', async () => {
        // First chapter with no lessons
        const chapter1Id = 'chapter-1';
        chapterRepository.create({
          id: chapter1Id,
          title: 'Chapter 1',
          description: 'First chapter',
          order: 1,
        });

        // Second chapter
        const chapter2Id = 'chapter-2';
        chapterRepository.create({
          id: chapter2Id,
          title: 'Chapter 2',
          description: 'Second chapter',
          order: 2,
        });

        const command: GetUserChaptersCommand = { userId };
        const result = await useCase.execute(command);

        // Second chapter should not be unlocked
        expect(result.chapters[1]?.is_unlocked).toBe(false);
      });
    });

    describe('calculateModulesProgress (tested indirectly)', () => {
      it('should correctly calculate modules progress', async () => {
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

        // Add three modules, complete 2 of them
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
        const result = await useCase.execute(command);

        // Should have 2 completed modules out of 3
        expect(result.chapters[0]?.lessons[0]?.completed_modules).toBe(2);
        expect(result.chapters[0]?.lessons[0]?.total_modules).toBe(3);
      });
    });
  });

  describe('Progress', () => {
    it('should correctly calculate modules progress', async () => {
      // Setup
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

      // Create modules and progressions for a very simple test case
      const mcqModule = createMcqModule('module-1', lessonId);
      gameModuleRepository.create(mcqModule);

      // Complete the module
      progressionRepository.create(
        createProgression('prog-1', userId, 'module-1', true),
      );

      const command: GetUserChaptersCommand = { userId };
      const result = await useCase.execute(command);

      // Verify module progress calculation
      expect(result.chapters[0]?.lessons[0]?.completed_modules).toBe(1);
      expect(result.chapters[0]?.lessons[0]?.total_modules).toBe(1);

      // Verify lesson is marked as completed
      expect(result.chapters[0]?.completed_lessons).toBe(1);
    });

    it('should unlock lessons based on completion status of previous lessons or chapters', async () => {
      // Create two chapters
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

      // Add one completed lesson to first chapter
      lessonRepository.create({
        id: 'lesson-1-1',
        chapterId: 'chapter-1',
        title: 'Lesson 1 of Chapter 1',
        description: 'First lesson',
        order: 1,
        gameType: GameType.MCQ,
      });

      // Add a module and complete it
      const mcqModule = createMcqModule('module-1', 'lesson-1-1');
      gameModuleRepository.create(mcqModule);
      progressionRepository.create(
        createProgression('prog-1', userId, 'module-1', true),
      );

      // Add first lesson to second chapter
      lessonRepository.create({
        id: 'lesson-2-1',
        chapterId: 'chapter-2',
        title: 'Lesson 1 of Chapter 2',
        description: 'First lesson of second chapter',
        order: 1,
        gameType: GameType.MCQ,
      });

      const command: GetUserChaptersCommand = { userId };
      const result = await useCase.execute(command);

      // Verify first chapter's lesson is unlocked and completed
      expect(result.chapters[0]?.lessons[0]?.is_unlocked).toBe(true);

      // Verify second chapter is unlocked since first is completed
      expect(result.chapters[1]?.is_unlocked).toBe(true);

      // Verify second chapter's lesson is also unlocked
      expect(result.chapters[1]?.lessons[0]?.is_unlocked).toBe(true);
    });
  });
});
