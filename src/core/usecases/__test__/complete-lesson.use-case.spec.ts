import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { GameType } from '../../domain/type/GameType';
import { CompleteLessonUseCase } from '../complete-lesson.use-case';
import { Lesson } from '../../domain/model/Lesson';
import { McqModule } from '../../domain/model/McqModule';
import { InMemoryLessonAttemptRepository } from '../../../adapters/in-memory/in-memory-lesson-attempt.repository';
import { InMemoryModuleAttemptRepository } from '../../../adapters/in-memory/in-memory-module-attempt.repository';
import { InMemoryLessonCompletionRepository } from '../../../adapters/in-memory/in-memory-lesson-completion.repository';

describe('CompleteLessonUseCase', () => {
  let gameModuleRepository: InMemoryGameModuleRepository;
  let lessonRepository: InMemoryLessonRepository;
  let lessonCompletionRepository: InMemoryLessonCompletionRepository;
  let lessonAttemptRepository: InMemoryLessonAttemptRepository;
  let moduleAttemptRepository: InMemoryModuleAttemptRepository;
  let useCase: CompleteLessonUseCase;

  beforeEach(() => {
    gameModuleRepository = new InMemoryGameModuleRepository();
    lessonRepository = new InMemoryLessonRepository();
    lessonCompletionRepository = new InMemoryLessonCompletionRepository();
    lessonAttemptRepository = new InMemoryLessonAttemptRepository();
    moduleAttemptRepository = new InMemoryModuleAttemptRepository();

    useCase = new CompleteLessonUseCase(
      lessonRepository,
      lessonCompletionRepository,
      lessonAttemptRepository,
      moduleAttemptRepository,
    );
    moduleAttemptRepository.removeAll();
    lessonAttemptRepository.removeAll();
    lessonCompletionRepository.removeAll();
    gameModuleRepository.removeAll();
    lessonRepository.removeAll();
  });

  it('should complete a lesson and return score and total game modules', async () => {
    // Given
    const userId = 'user-1';
    const lessonId = 'lesson-1';

    const gameModule1 = new McqModule({
      id: 'module-1',
      lessonId: lessonId,
      question: 'What is 1+1?',
      choices: [
        {
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    gameModuleRepository.create(gameModule1);
    const gameModule2 = new McqModule({
      id: 'module-2',
      lessonId: lessonId,
      question: 'What is 2+2?',
      choices: [
        {
          id: 'choice-2',
          text: '4',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-3',
          text: '5',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    gameModuleRepository.create(gameModule2);
    const gameModule3 = new McqModule({
      id: 'module-3',
      lessonId: lessonId,
      question: 'What is 3+3?',
      choices: [
        {
          id: 'choice-3',
          text: '6',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-4',
          text: '7',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    gameModuleRepository.create(gameModule3);

    const lesson = new Lesson(
      'lesson-1',
      'Lesson 1',
      'Description of Lesson 1',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [gameModule1, gameModule2, gameModule3],
    );
    lessonRepository.create(lesson);

    lessonAttemptRepository.create({
      id: 'attempt-1',
      userId,
      lessonId,
      startedAt: new Date(),
      finishedAt: undefined,
    });
    moduleAttemptRepository.create({
      id: 'module-attempt-1',
      userId,
      gameModuleId: gameModule1.id,
      lessonAttemptId: 'attempt-1',
      isCorrect: true,
      answeredAt: new Date(),
    });
    moduleAttemptRepository.create({
      id: 'module-attempt-2',
      userId,
      gameModuleId: gameModule2.id,
      lessonAttemptId: 'attempt-1',
      isCorrect: true,
      answeredAt: new Date(),
    });
    moduleAttemptRepository.create({
      id: 'module-attempt-3',
      userId,
      gameModuleId: gameModule3.id,
      lessonAttemptId: 'attempt-1',
      isCorrect: false,
      answeredAt: new Date(),
    });

    // When
    const result = await useCase.execute({
      userId,
      lessonId: lesson.id,
    });

    // Then
    expect(result).toEqual({
      completedGameModules: 2,
      totalGameModules: 3,
      isCompleted: false,
    });
  });

  it('should complete a lesson with 80% score and mark it as completed', async () => {
    // Given
    const userId = 'user-2';
    const lessonId = 'lesson-2';

    const gameModule1 = new McqModule({
      id: 'module-1',
      lessonId: lessonId,
      question: 'What is 1+1?',
      choices: [
        {
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    gameModuleRepository.create(gameModule1);
    const gameModule2 = new McqModule({
      id: 'module-2',
      lessonId: lessonId,
      question: 'What is 2+2?',
      choices: [
        {
          id: 'choice-3',
          text: '4',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-4',
          text: '5',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    gameModuleRepository.create(gameModule2);

    const lesson = new Lesson(
      lessonId,
      'Lesson 2',
      'Description of Lesson 2',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [gameModule1, gameModule2],
    );
    lessonRepository.create(lesson);

    lessonAttemptRepository.create({
      id: 'attempt-2',
      userId,
      lessonId,
      startedAt: new Date(),
      finishedAt: undefined,
    });
    moduleAttemptRepository.create({
      id: 'module-attempt-4',
      userId,
      gameModuleId: gameModule1.id,
      lessonAttemptId: 'attempt-2',
      isCorrect: true,
      answeredAt: new Date(),
    });
    moduleAttemptRepository.create({
      id: 'module-attempt-5',
      userId,
      gameModuleId: gameModule2.id,
      lessonAttemptId: 'attempt-2',
      isCorrect: true,
      answeredAt: new Date(),
    });

    // When
    const result = await useCase.execute({
      userId,
      lessonId: lesson.id,
    });

    // Then
    expect(result).toEqual({
      completedGameModules: 2,
      totalGameModules: 2,
      isCompleted: true,
    });
  });

  it('should throw an error if lesson not found', async () => {
    // Given
    const userId = 'user-3';
    const lessonId = 'non-existent-lesson';

    // When & Then
    await expect(
      useCase.execute({
        userId,
        lessonId,
      }),
    ).rejects.toThrow('Lesson with id non-existent-lesson not found');
  });

  it('should throw LessonAlreadyCompletedError if lesson already completed', async () => {
    const userId = 'user-3';
    const lessonId = 'lesson-3';
    const gameModule1 = new McqModule({
      id: 'module-1',
      lessonId: lessonId,
      question: 'What is 1+1?',
      choices: [
        {
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    gameModuleRepository.create(gameModule1);
    const lesson = new Lesson(
      lessonId,
      'Lesson 3',
      'Description of Lesson 3',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [gameModule1],
    );
    lessonRepository.create(lesson);
    lessonCompletionRepository.create({
      id: 'completion-1',
      userId,
      lessonId,
      score: 100,
      completedAt: new Date(),
    });
    await expect(
      useCase.execute({ userId, lessonId: lesson.id }),
    ).rejects.toThrow('Lesson with id lesson-3 has already been completed.');
  });

  it('should throw LessonAttemptNotFoundError if no lesson attempt exists', async () => {
    const userId = 'user-4';
    const lessonId = 'lesson-4';
    const gameModule1 = new McqModule({
      id: 'module-1',
      lessonId: lessonId,
      question: 'What is 1+1?',
      choices: [
        {
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    gameModuleRepository.create(gameModule1);
    const lesson = new Lesson(
      lessonId,
      'Lesson 4',
      'Description of Lesson 4',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [gameModule1],
    );
    lessonRepository.create(lesson);
    await expect(
      useCase.execute({
        userId,
        lessonId: lesson.id,
      }),
    ).rejects.toThrow(
      'Lesson attempt not found for user user-4 and lesson lesson-4',
    );
  });

  it('should throw LessonAttemptAlreadyFinishedError if lesson attempt is already finished', async () => {
    const userId = 'user-5';
    const lessonId = 'lesson-5';
    const gameModule1 = new McqModule({
      id: 'module-1',
      lessonId: lessonId,
      question: 'What is 1+1?',
      choices: [
        {
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    gameModuleRepository.create(gameModule1);
    const lesson = new Lesson(
      lessonId,
      'Lesson 5',
      'Description of Lesson 5',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [gameModule1],
    );
    lessonRepository.create(lesson);
    lessonAttemptRepository.create({
      id: 'attempt-5',
      userId,
      lessonId,
      startedAt: new Date(),
      finishedAt: new Date(),
    });
    await expect(
      useCase.execute({ userId, lessonId: lesson.id }),
    ).rejects.toThrow(
      'Lesson attempt with id attempt-5 has already been finished.',
    );
  });

  it('should throw LessonNotFullyAttemptedError if not all modules are attempted', async () => {
    const userId = 'user-6';
    const lessonId = 'lesson-6';
    const gameModule1 = new McqModule({
      id: 'module-1',
      lessonId: lessonId,
      question: 'What is 1+1?',
      choices: [
        {
          id: 'choice-1',
          text: '2',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-2',
          text: '3',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    const gameModule2 = new McqModule({
      id: 'module-2',
      lessonId: lessonId,
      question: 'What is 2+2?',
      choices: [
        {
          id: 'choice-3',
          text: '4',
          isCorrect: true,
          correctionMessage: 'Yes',
        },
        {
          id: 'choice-4',
          text: '5',
          isCorrect: false,
          correctionMessage: 'No',
        },
      ],
    });
    gameModuleRepository.create(gameModule1);
    gameModuleRepository.create(gameModule2);
    const lesson = new Lesson(
      lessonId,
      'Lesson 6',
      'Description of Lesson 6',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [gameModule1, gameModule2],
    );
    lessonRepository.create(lesson);
    lessonAttemptRepository.create({
      id: 'attempt-6',
      userId,
      lessonId,
      startedAt: new Date(),
      finishedAt: undefined,
    });
    moduleAttemptRepository.create({
      id: 'module-attempt-1',
      userId,
      gameModuleId: gameModule1.id,
      lessonAttemptId: 'attempt-6',
      isCorrect: true,
      answeredAt: new Date(),
    });
    // module 2 non tenté
    await expect(
      useCase.execute({
        userId,
        lessonId: lesson.id,
      }),
    ).rejects.toThrow(
      'All modules in lesson lesson-6 have not been fully attempted. Attempted: 1, Total: 2',
    );
  });
});
