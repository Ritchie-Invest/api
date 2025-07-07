import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { GameModuleController } from '../game-module.controller';
import { CompleteGameModuleUseCase } from '../../../../core/usecases/complete-game-module.usecase';
import {
  CompleteGameModuleRequest,
  McqAnswerRequest,
} from '../../request/complete-game-module.request';
import { GameModuleNotFoundError } from '../../../../core/domain/error/GameModuleNotFoundError';
import { InvalidAnswerError } from '../../../../core/domain/error/InvalidAnswerError';
import { UserType } from '../../../../core/domain/type/UserType';
import { GameType } from '../../../../core/domain/type/GameType';
import { InMemoryUserRepository } from '../../../in-memory/in-memory-user.repository';
import { InMemoryGameModuleRepository } from '../../../in-memory/in-memory-game-module.repository';
import { InMemoryProgressionRepository } from '../../../in-memory/in-memory-progression.repository';
import { InMemoryRefreshTokenRepository } from '../../../in-memory/in-memory-refresh-token.repository';
import { UserRepository } from '../../../../core/domain/repository/user.repository';
import { GameModuleRepository } from '../../../../core/domain/repository/game-module.repository';
import { ProgressionRepository } from '../../../../core/domain/repository/progression.repository';
import { RefreshTokenRepository } from '../../../../core/domain/repository/refresh-token.repository';
import { User } from '../../../../core/domain/model/User';
import { McqModule } from '../../../../core/domain/model/McqModule';
import { McqChoice } from '../../../../core/domain/model/McqChoice';
import {
  CompleteGameModuleStrategyFactory,
  MapCompleteGameModuleStrategyFactory,
} from '../../../../core/usecases/strategies/complete-game-module-strategy-factory';
import { McqCompleteGameModuleStrategy } from '../../../../core/usecases/strategies/mcq-complete-game-module-strategy';

describe('GameModuleController', () => {
  let controller: GameModuleController;
  let userRepository: InMemoryUserRepository;
  let gameModuleRepository: InMemoryGameModuleRepository;
  let progressionRepository: InMemoryProgressionRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;

  beforeEach(async () => {
    // Create in-memory repositories
    userRepository = new InMemoryUserRepository();
    gameModuleRepository = new InMemoryGameModuleRepository();
    progressionRepository = new InMemoryProgressionRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();

    // Create strategy factory
    const strategyFactory = new MapCompleteGameModuleStrategyFactory([
      {
        type: GameType.MCQ,
        strategy: new McqCompleteGameModuleStrategy(),
      },
    ]);

    const mockTokenService = {
      verifyAccessToken: jest.fn(),
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameModuleController],
      providers: [
        {
          provide: CompleteGameModuleUseCase,
          useFactory: (
            gameModuleRepo: GameModuleRepository,
            progressionRepo: ProgressionRepository,
            strategyFactory: CompleteGameModuleStrategyFactory,
          ) =>
            new CompleteGameModuleUseCase(
              gameModuleRepo,
              progressionRepo,
              strategyFactory,
            ),
          inject: [
            GameModuleRepository,
            ProgressionRepository,
            'CompleteGameModuleStrategyFactory',
          ],
        },
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: GameModuleRepository,
          useValue: gameModuleRepository,
        },
        {
          provide: ProgressionRepository,
          useValue: progressionRepository,
        },
        {
          provide: RefreshTokenRepository,
          useValue: refreshTokenRepository,
        },
        {
          provide: 'CompleteGameModuleStrategyFactory',
          useValue: strategyFactory,
        },
        {
          provide: 'TokenService',
          useValue: mockTokenService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    controller = module.get<GameModuleController>(GameModuleController);
  });

  afterEach(() => {
    // Clean up repositories between tests
    userRepository.removeAll();
    gameModuleRepository.removeAll();
    progressionRepository.removeAll();
    refreshTokenRepository.removeAll();
  });

  describe('completeGameModule', () => {
    let testUser: User;
    let testGameModule: McqModule;
    let correctChoiceId: string;
    let incorrectChoiceId: string;

    beforeEach(() => {
      // Create test data
      testUser = userRepository.create({
        id: 'user-123',
        email: 'test@example.com',
        password: 'password',
        type: UserType.STUDENT,
      });

      const choices = [
        new McqChoice({
          id: 'choice-1',
          text: 'Correct answer',
          isCorrect: true,
          correctionMessage: 'Well done!',
        }),
        new McqChoice({
          id: 'choice-2',
          text: 'Wrong answer',
          isCorrect: false,
          correctionMessage: 'Not quite right.',
        }),
      ];

      testGameModule = new McqModule({
        id: 'module-456',
        lessonId: 'lesson-789',
        question: 'What is 2 + 2?',
        choices: choices,
      });

      gameModuleRepository.create(testGameModule);

      correctChoiceId = 'choice-1';
      incorrectChoiceId = 'choice-2';
    });

    it('should return correct answer response when answer is correct', async () => {
      // Given
      const moduleId = testGameModule.id;
      const request = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest(correctChoiceId),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockReq = {
        user: {
          id: testUser.id,
          email: testUser.email,
          type: testUser.type,
        },
      } as any;

      // When

      const response = await controller.completeGameModule(
        moduleId,
        request,
        mockReq,
      );

      // Then
      expect(response.correctAnswer).toBe(true);
      expect(response.feedback).toBe('Well done!');

      // Verify progression was created
      const progression = progressionRepository.findByUserIdAndGameModuleId(
        testUser.id,
        testGameModule.id,
      );
      expect(progression).toBeDefined();
      expect(progression?.isCompleted).toBe(true);
    });

    it('should return incorrect answer response when answer is wrong', async () => {
      // Given
      const moduleId = testGameModule.id;
      const request = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest(incorrectChoiceId),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockReq = {
        user: {
          id: testUser.id,
          email: testUser.email,
          type: testUser.type,
        },
      } as any;

      // When

      const response = await controller.completeGameModule(
        moduleId,
        request,
        mockReq,
      );

      // Then
      expect(response.correctAnswer).toBe(false);
      expect(response.feedback).toBe('Not quite right.');

      // Verify progression was NOT created for wrong answer
      const progression = progressionRepository.findByUserIdAndGameModuleId(
        testUser.id,
        testGameModule.id,
      );
      expect(progression).toBeNull();
    });

    it('should throw GameModuleNotFoundError when module does not exist', async () => {
      // Given
      const nonExistentModuleId = 'non-existent-module';
      const request = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest(correctChoiceId),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockReq = {
        user: {
          id: testUser.id,
          email: testUser.email,
          type: testUser.type,
        },
      } as any;

      // When & Then

      await expect(
        controller.completeGameModule(nonExistentModuleId, request, mockReq),
      ).rejects.toThrow(GameModuleNotFoundError);
    });

    it('should throw InvalidAnswerError when choice does not exist', async () => {
      // Given
      const moduleId = testGameModule.id;
      const request = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest('non-existent-choice'),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockReq = {
        user: {
          id: testUser.id,
          email: testUser.email,
          type: testUser.type,
        },
      } as any;

      // When & Then

      await expect(
        controller.completeGameModule(moduleId, request, mockReq),
      ).rejects.toThrow(InvalidAnswerError);
    });
  });
});
