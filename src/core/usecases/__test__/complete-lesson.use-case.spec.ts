import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { InMemoryProgressionRepository } from '../../../adapters/in-memory/in-memory-progression.repository';
import { GameType } from '../../domain/type/GameType';
import { CompleteLessonUseCase } from '../complete-lesson.use-case';
import { Lesson } from '../../domain/model/Lesson';
import { Progression } from '../../domain/model/Progression';
import { McqModule } from '../../domain/model/McqModule';

describe('CompleteLessonUseCase', () => {
  let gameModuleRepository: InMemoryGameModuleRepository;
  let lessonRepository: InMemoryLessonRepository;
  let progressionRepository: InMemoryProgressionRepository;
  let useCase: CompleteLessonUseCase;

  beforeEach(() => {
    gameModuleRepository = new InMemoryGameModuleRepository();
    lessonRepository = new InMemoryLessonRepository();
    progressionRepository = new InMemoryProgressionRepository(
      gameModuleRepository,
    );

    useCase = new CompleteLessonUseCase(
      progressionRepository,
      lessonRepository,
    );
    progressionRepository.removeAll();
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

    const progression1 = new Progression(
      'progression-1',
      userId,
      gameModule1.id,
      true,
    );
    progressionRepository.create(progression1);
    const progression2 = new Progression(
      'progression-2',
      userId,
      gameModule2.id,
      true,
    );
    progressionRepository.create(progression2);

    // When
    const result = await useCase.execute({
      userId,
      lessonId: lesson.id,
    });

    // Then
    expect(result).toEqual({
      score: 2,
      totalGameModules: 3,
    });
  });

  it('should return 0 score if no modules completed', async () => {
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

    const lesson = new Lesson(
      'lesson-2',
      'Lesson 2',
      'Description of Lesson 2',
      'chapter-1',
      1,
      false,
      GameType.MCQ,
      [gameModule1],
    );
    lessonRepository.create(lesson);

    // When
    const result = await useCase.execute({
      userId,
      lessonId: lesson.id,
    });

    // Then
    expect(result).toEqual({
      score: 0,
      totalGameModules: 1,
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
});
