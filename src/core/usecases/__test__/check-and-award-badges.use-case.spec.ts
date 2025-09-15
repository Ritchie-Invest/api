import { CheckAndAwardBadgesUseCase } from '../check-and-award-badges.use-case';
import { BadgeType } from '../../domain/type/BadgeType';
import { InMemoryUserBadgeRepository } from '../../../adapters/in-memory/in-memory-user-badge.repository';
import { InMemoryLessonCompletionRepository } from '../../../adapters/in-memory/in-memory-lesson-completion.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { LessonCompletion } from '../../domain/model/LessonCompletion';
import { GameModule } from '../../domain/model/GameModule';

describe('CheckAndAwardBadgesUseCase', () => {
  let userBadgeRepo: InMemoryUserBadgeRepository;
  let lessonCompletionRepo: InMemoryLessonCompletionRepository;
  let lessonRepo: InMemoryLessonRepository;
  let useCase: CheckAndAwardBadgesUseCase;
  const userId = 'user-1';

  beforeEach(() => {
    userBadgeRepo = new InMemoryUserBadgeRepository();
    lessonCompletionRepo = new InMemoryLessonCompletionRepository();
    lessonRepo = new InMemoryLessonRepository();
    useCase = new CheckAndAwardBadgesUseCase(
      userBadgeRepo,
      lessonCompletionRepo,
      lessonRepo,
    );
    lessonRepo.removeAll();
    lessonCompletionRepo.removeAll();
    userBadgeRepo.removeAll();
  });

  it('awards LEARN_PERFECT_QUIZ when lesson is completed with all modules', async () => {
    // Given
    const modules: GameModule[] = [
      {
        id: 'm1',
        lessonId: 'lesson-1',
        updatedAt: new Date(),
        createdAt: new Date(),
      } as GameModule,
      {
        id: 'm2',
        lessonId: 'lesson-1',
        updatedAt: new Date(),
        createdAt: new Date(),
      } as GameModule,
      {
        id: 'm3',
        lessonId: 'lesson-1',
        updatedAt: new Date(),
        createdAt: new Date(),
      } as GameModule,
    ];
    lessonRepo.create({
      id: 'lesson-1',
      title: 'Test',
      description: 'desc',
      chapterId: 'chapter-1',
      order: 1,
      modules,
    });

    lessonCompletionRepo.create(
      new LessonCompletion('lc-1', userId, 'lesson-1', 100, new Date()),
    );

    // When
    const result = await useCase.execute({
      userId,
      lessonId: 'lesson-1',
      completedModules: 3,
      totalModules: 3,
    });

    // Then
    expect(result.map((b) => b.type)).toContain(BadgeType.LEARN_PERFECT_QUIZ);
  });

  it('awards PROG_5_LESSONS after 5 lessons completed', async () => {
    // Given
    for (let i = 1; i <= 5; i++) {
      const modules: GameModule[] = [
        {
          id: `m${i}`,
          lessonId: `lesson-${i}`,
          updatedAt: new Date(),
          createdAt: new Date(),
        } as GameModule,
      ];
      lessonRepo.create({
        id: `lesson-${i}`,
        title: 'Test',
        description: 'desc',
        chapterId: 'chapter-1',
        order: i,
        modules,
      });
      lessonCompletionRepo.create(
        new LessonCompletion(`lc-${i}`, userId, `lesson-${i}`, 80, new Date()),
      );
    }

    // When
    const result = await useCase.execute({
      userId,
      lessonId: 'lesson-5',
      completedModules: 1,
      totalModules: 1,
    });

    // Then
    expect(result.map((b) => b.type)).toContain(BadgeType.PROG_5_LESSONS);
  });
});
