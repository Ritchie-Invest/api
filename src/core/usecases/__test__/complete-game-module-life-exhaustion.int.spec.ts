/* eslint-disable @typescript-eslint/unbound-method */
import {
  CompleteGameModuleUseCase,
  CompleteGameModuleCommand,
} from '../complete-game-module.use-case';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { InMemoryLessonAttemptRepository } from '../../../adapters/in-memory/in-memory-lesson-attempt.repository';
import { InMemoryModuleAttemptRepository } from '../../../adapters/in-memory/in-memory-module-attempt.repository';
import { MapCompleteGameModuleStrategyFactory } from '../strategies/complete-game-module-strategy-factory';
import { McqCompleteGameModuleStrategy } from '../strategies/mcq-complete-game-module-strategy';
import { FillInTheBlankCompleteGameModuleStrategy } from '../strategies/fill-in-the-blanks-complete-game-module-strategy';
import { TrueOrFalseCompleteGameModuleStrategy } from '../strategies/true-or-false-complete-game-module-strategy';
import { GameType } from '../../domain/type/GameType';
import { Lesson } from '../../domain/model/Lesson';
import { McqModule } from '../../domain/model/McqModule';
import { McqChoice } from '../../domain/model/McqChoice';
import { LifeService, UserLifeData } from '../services/life.service';

/**
 * Test d'intégration ciblé sur la mécanique d'épuisement des vies.
 * Stratégie: Simuler 5 réponses incorrectes sur 5 modules d'une leçon.
 * Après chaque réponse incorrecte: addLostLife et getUserLifeData doivent être appelés.
 * À la 5ème: le champ isLost doit passer à true (has_lost fourni par le mock).
 */

describe('CompleteGameModuleUseCase - Life exhaustion integration', () => {
  let gameModuleRepository: InMemoryGameModuleRepository;
  let lessonRepository: InMemoryLessonRepository;
  let lessonAttemptRepository: InMemoryLessonAttemptRepository;
  let moduleAttemptRepository: InMemoryModuleAttemptRepository;
  let mockLifeService: jest.Mocked<LifeService>;
  let useCase: CompleteGameModuleUseCase;
  const userId = 'user-life-test';

  beforeEach(() => {
    gameModuleRepository = new InMemoryGameModuleRepository();
    lessonRepository = new InMemoryLessonRepository();
    lessonAttemptRepository = new InMemoryLessonAttemptRepository();
    moduleAttemptRepository = new InMemoryModuleAttemptRepository();

    mockLifeService = {
      getUserLifeData: jest.fn(),
      addLostLife: jest.fn(),
    } as unknown as jest.Mocked<LifeService>;

    const strategyFactory = new MapCompleteGameModuleStrategyFactory([
      { type: GameType.MCQ, strategy: new McqCompleteGameModuleStrategy() },
      {
        type: GameType.FILL_IN_THE_BLANK,
        strategy: new FillInTheBlankCompleteGameModuleStrategy(),
      },
      {
        type: GameType.TRUE_OR_FALSE,
        strategy: new TrueOrFalseCompleteGameModuleStrategy(),
      },
    ]);

    useCase = new CompleteGameModuleUseCase(
      gameModuleRepository,
      lessonRepository,
      strategyFactory,
      lessonAttemptRepository,
      moduleAttemptRepository,
      mockLifeService,
    );
  });

  const setupLessonWithFiveIncorrectModules = () => {
    const lesson = new Lesson(
      'lesson-life',
      'Life Test',
      'desc',
      'chapter-1',
      1,
      true,
    );
    lessonRepository.create(lesson);
    for (let i = 1; i <= 5; i++) {
      const correct = new McqChoice({
        id: `c-${i}`,
        text: 'Correct',
        isCorrect: true,
        correctionMessage: 'OK',
      });
      const wrong = new McqChoice({
        id: `w-${i}`,
        text: 'Wrong',
        isCorrect: false,
        correctionMessage: 'No',
      });
      const module = new McqModule({
        id: `module-${i}`,
        lessonId: lesson.id,
        question: `Q${i}`,
        choices: [correct, wrong],
      });
      gameModuleRepository.create(module);
    }
  };

  it('should progressively reduce lives and set isLost=true on 5th incorrect answer', async () => {
    setupLessonWithFiveIncorrectModules();

    // Mock progression: life_number 4 -> 3 -> 2 -> 1 -> 0
    const lifeProgression: UserLifeData[] = [
      { life_number: 4, next_life_in: 1000, has_lost: false },
      { life_number: 3, next_life_in: 2000, has_lost: false },
      { life_number: 2, next_life_in: 2500, has_lost: false },
      { life_number: 1, next_life_in: 3000, has_lost: false },
      { life_number: 0, next_life_in: 3600, has_lost: true },
    ];
    lifeProgression.forEach((lp) => {
      mockLifeService.getUserLifeData.mockResolvedValueOnce(lp);
    });

    for (let i = 1; i <= 5; i++) {
      const command: CompleteGameModuleCommand = {
        userId,
        moduleId: `module-${i}`,
        gameType: GameType.MCQ,
        mcq: { choiceId: `w-${i}` },
      };
      const result = await useCase.execute(command);
      expect(result.isCorrect).toBe(false);
      expect(result.isLost).toBe(i === 5);
    }

    expect(mockLifeService.addLostLife).toHaveBeenCalledTimes(5);
    expect(mockLifeService.getUserLifeData).toHaveBeenCalledTimes(5);
  });
});
