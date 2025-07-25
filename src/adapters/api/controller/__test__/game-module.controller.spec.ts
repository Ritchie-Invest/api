import { Test, TestingModule } from '@nestjs/testing';

import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { DomainErrorFilter } from '../../../../config/domain-error.filter';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../../../../core/domain/service/token.service';
import { UserType } from '../../../../core/domain/type/UserType';
import { GameType } from '../../../../core/domain/type/GameType';
import { GameModuleRepository } from '../../../../core/domain/repository/game-module.repository';
import { ProgressionRepository } from '../../../../core/domain/repository/progression.repository';
import { LessonRepository } from '../../../../core/domain/repository/lesson.repository';
import { ChapterRepository } from '../../../../core/domain/repository/chapter.repository';
import { UserRepository } from '../../../../core/domain/repository/user.repository';
import {
  CompleteGameModuleRequest,
  McqAnswerRequest,
} from '../../request/complete-game-module.request';
import { McqModule } from '../../../../core/domain/model/McqModule';
import { McqChoice } from '../../../../core/domain/model/McqChoice';
import { CompleteGameModuleResponse } from '../../response/complete-game-module.response';
import { AppModule } from '../../../../app.module';
import { UpdateGameModuleRequest } from '../../request/update-game-module.request';
import { ChapterFactory } from './utils/chapter.factory';
import { LessonFactory } from './utils/lesson.factory';

describe('GameModuleControllerIT', () => {
  let app: INestApplication<App>;
  let chapterRepository: ChapterRepository;
  let lessonRepository: LessonRepository;
  let gameModuleRepository: GameModuleRepository;
  let progressionRepository: ProgressionRepository;
  let userRepository: UserRepository;
  let tokenService: TokenService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const reflector = moduleFixture.get(Reflector);

    app.useGlobalFilters(new DomainErrorFilter());
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalGuards(
      new JwtAuthGuard(app.get('TokenService'), reflector),
      new RolesGuard(reflector),
    );

    await app.init();
  });

  beforeEach(async () => {
    chapterRepository = app.get(ChapterRepository);
    lessonRepository = app.get(LessonRepository);
    gameModuleRepository = app.get(GameModuleRepository);
    progressionRepository = app.get(ProgressionRepository);
    userRepository = app.get(UserRepository);
    tokenService = app.get('TokenService');

    await progressionRepository.removeAll();
    await gameModuleRepository.removeAll();
    await lessonRepository.removeAll();
    await chapterRepository.removeAll();
    await userRepository.removeAll();

    await userRepository.create({
      id: 'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
      email: 'test@ritchie-invest.com',
      password: 'hashedPassword123',
      type: UserType.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterEach(async () => {
    await progressionRepository.removeAll();
    await gameModuleRepository.removeAll();
    await lessonRepository.removeAll();
    await chapterRepository.removeAll();
    await userRepository.removeAll();
  });

  describe('getGameModuleById', () => {
    it('should return game module by id as admin', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);
      const lesson = LessonFactory.make({
        chapterId: chapter.id,
      });
      await lessonRepository.create(lesson);
      const choices = [
        new McqChoice({
          id: 'choice-1',
          text: 'Choice 1',
          isCorrect: true,
          correctionMessage: 'Correct!',
        }),
        new McqChoice({
          id: 'choice-2',
          text: 'Choice 2',
          isCorrect: false,
          correctionMessage: 'Incorrect.',
        }),
      ];
      const gameModule = new McqModule({
        id: 'module-123',
        lessonId: lesson.id,
        question: 'What is 2 + 2?',
        choices: choices,
      });
      await gameModuleRepository.create(gameModule);

      // When
      const response = await request(app.getHttpServer())
        .get(`/modules/module-123`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        id: 'module-123',
        lessonId: lesson.id,
        details: {
          question: 'What is 2 + 2?',
          choices: [
            {
              id: 'choice-1',
              text: 'Choice 1',
              isCorrect: true,
              correctionMessage: 'Correct!',
            },
            {
              id: 'choice-2',
              text: 'Choice 2',
              isCorrect: false,
              correctionMessage: 'Incorrect.',
            },
          ],
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updatedAt: expect.any(String),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        createdAt: expect.any(String),
      });
    });

    describe('getGameModuleById', () => {
      it('should return game module by id as admin', async () => {
        // Given
        const adminToken = generateAccessToken(UserType.ADMIN);
        const chapter = ChapterFactory.make();
        await chapterRepository.create(chapter);
        const lesson = LessonFactory.make({
          chapterId: chapter.id,
        });
        await lessonRepository.create(lesson);
        const choices = [
          new McqChoice({
            id: 'choice-1',
            text: 'Choice 1',
            isCorrect: true,
            correctionMessage: 'Correct!',
          }),
          new McqChoice({
            id: 'choice-2',
            text: 'Choice 2',
            isCorrect: false,
            correctionMessage: 'Incorrect.',
          }),
        ];
        const gameModule = new McqModule({
          id: 'module-123',
          lessonId: lesson.id,
          question: 'What is 2 + 2?',
          choices: choices,
        });
        await gameModuleRepository.create(gameModule);

        // When
        const response = await request(app.getHttpServer())
          .get(`/modules/module-123`)
          .set('Authorization', `Bearer ${adminToken}`);

        // Then
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          id: 'module-123',
          lessonId: lesson.id,
          details: {
            question: 'What is 2 + 2?',
            choices: [
              {
                id: 'choice-1',
                text: 'Choice 1',
                isCorrect: true,
                correctionMessage: 'Correct!',
              },
              {
                id: 'choice-2',
                text: 'Choice 2',
                isCorrect: false,
                correctionMessage: 'Incorrect.',
              },
            ],
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          updatedAt: expect.any(String),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          createdAt: expect.any(String),
        });
      });

      it('should return game module by id as student', async () => {
        // Given
        const adminToken = generateAccessToken(UserType.STUDENT);
        const chapter = ChapterFactory.make();
        await chapterRepository.create(chapter);
        const lesson = LessonFactory.make({
          chapterId: chapter.id,
        });
        await lessonRepository.create(lesson);
        const choices = [
          new McqChoice({
            id: 'choice-1',
            text: 'Choice 1',
            isCorrect: true,
            correctionMessage: 'Correct!',
          }),
          new McqChoice({
            id: 'choice-2',
            text: 'Choice 2',
            isCorrect: false,
            correctionMessage: 'Incorrect.',
          }),
        ];
        const gameModule = new McqModule({
          id: 'module-123',
          lessonId: lesson.id,
          question: 'What is 2 + 2?',
          choices: choices,
        });
        await gameModuleRepository.create(gameModule);

        // When
        const response = await request(app.getHttpServer())
          .get(`/modules/module-123`)
          .set('Authorization', `Bearer ${adminToken}`);

        // Then
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual({
          id: 'module-123',
          lessonId: lesson.id,
          details: {
            question: 'What is 2 + 2?',
            choices: [
              {
                id: 'choice-1',
                text: 'Choice 1',
              },
              {
                id: 'choice-2',
                text: 'Choice 2',
              },
            ],
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          updatedAt: expect.any(String),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          createdAt: expect.any(String),
        });
      });

      it('should return 404 if game module not found', async () => {
        // Given
        const adminToken = generateAccessToken(UserType.ADMIN);

        // When
        const response = await request(app.getHttpServer())
          .get('/modules/non-existing-id')
          .set('Authorization', `Bearer ${adminToken}`);

        // Then
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body.message).toBe(
          'Game module with id non-existing-id not found',
        );
      });

      it('should return 401 if not authenticated', async () => {
        // When
        const response = await request(app.getHttpServer()).get(
          '/modules/existing-id',
        );

        // Then
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body.message).toBe('No token provided');
      });
    });
  });

  describe('updateGameModule', () => {
    it('should create a game module for a lesson', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);
      const lesson = LessonFactory.make({
        chapterId: chapter.id,
      });
      await lessonRepository.create(lesson);
      const mcqModule = new McqModule({
        id: 'module-123',
        lessonId: lesson.id,
        question: 'What is 2 + 2?',
        choices: [
          new McqChoice({
            id: 'choice-1',
            text: '4',
            isCorrect: true,
            correctionMessage: 'Correct!',
          }),
          new McqChoice({
            id: 'choice-2',
            text: '5',
            isCorrect: false,
            correctionMessage: 'Incorrect.',
          }),
        ],
      });
      const createdModule = await gameModuleRepository.create(mcqModule);
      const updateGameModuleRequest = new UpdateGameModuleRequest(
        GameType.MCQ,
        {
          question: 'What is the capital of France?',
          choices: [
            {
              text: 'Paris',
              isCorrect: true,
              correctionMessage: 'Correct! Paris is the capital of France.',
            },
            {
              text: 'London',
              isCorrect: false,
              correctionMessage:
                'Incorrect! London is not the capital of France.',
            },
          ],
        },
      );

      // When
      const response = await request(app.getHttpServer())
        .post(`/modules/${createdModule.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateGameModuleRequest);

      // Then
      const updatedModule = (await gameModuleRepository.findById(
        createdModule.id,
      )) as McqModule;
      expect(updatedModule).toBeDefined();
      expect(updatedModule).toMatchObject({
        question: 'What is the capital of France?',
        choices: [
          {
            text: 'Paris',
            isCorrect: true,
            correctionMessage: 'Correct! Paris is the capital of France.',
          },
          {
            text: 'London',
            isCorrect: false,
            correctionMessage:
              'Incorrect! London is not the capital of France.',
          },
        ],
      });
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchObject({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        isPublished: lesson.isPublished,
        chapterId: chapter.id,
        order: lesson.order,
        gameType: GameType.MCQ,
        modules: [
          {
            id: 'module-123',
            lessonId: lesson.id,
            question: 'What is the capital of France?',
            choices: [
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                id: expect.any(String),
                text: 'Paris',
                isCorrect: true,
                correctionMessage: 'Correct! Paris is the capital of France.',
              },
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                id: expect.any(String),
                text: 'London',
                isCorrect: false,
                correctionMessage:
                  'Incorrect! London is not the capital of France.',
              },
            ],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            updatedAt: expect.any(String),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            createdAt: expect.any(String),
          },
        ],
      });
    });

    it('should return 404 if lesson not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);

      // When
      const response = await request(app.getHttpServer())
        .post('/modules/non-existing-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ gameType: GameType.MCQ });

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Game module with id non-existing-id not found',
      );
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const updateGameModuleRequest = new UpdateGameModuleRequest(
        GameType.MCQ,
        {
          question: 'What is 2 + 2?',
          choices: [
            {
              text: '4',
              isCorrect: true,
              correctionMessage: 'Correct!',
            },
            {
              text: '5',
              isCorrect: false,
              correctionMessage: 'Incorrect.',
            },
          ],
        },
      );

      // When
      const response = await request(app.getHttpServer())
        .post(`/modules/existing-lesson-id`)
        .send(updateGameModuleRequest);

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('completeGameModule', () => {
    it('should return correct answer response when answer is correct', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);
      const lesson = LessonFactory.make({
        chapterId: chapter.id,
      });
      await lessonRepository.create(lesson);

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

      const testGameModule = new McqModule({
        id: 'module-456',
        lessonId: lesson.id,
        question: 'What is 2 + 2?',
        choices: choices,
      });

      await gameModuleRepository.create(testGameModule);

      const completeGameModuleRequest = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest('choice-1'),
      );

      // When
      const response = await request(app.getHttpServer())
        .post(`/modules/${testGameModule.id}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(completeGameModuleRequest);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      const responseBody = response.body as CompleteGameModuleResponse;
      expect(responseBody.isCorrect).toBe(true);
      expect(responseBody.feedback).toBe('Well done!');
      expect(responseBody.nextGameModuleId).toBeNull();
      expect(responseBody.currentGameModuleIndex).toBe(0);
      expect(responseBody.totalGameModules).toBe(1);

      const progression =
        await progressionRepository.findByUserIdAndGameModuleId(
          'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
          testGameModule.id,
        );
      expect(progression).toBeDefined();
      expect(progression?.isCompleted).toBe(true);
    });

    it('should return incorrect answer response when answer is wrong', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);
      const lesson = LessonFactory.make({
        chapterId: chapter.id,
      });
      await lessonRepository.create(lesson);

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

      const testGameModule = new McqModule({
        id: 'module-456',
        lessonId: lesson.id,
        question: 'What is 2 + 2?',
        choices: choices,
      });

      await gameModuleRepository.create(testGameModule);

      const completeGameModuleRequest = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest('choice-2'),
      );

      // When
      const response = await request(app.getHttpServer())
        .post(`/modules/${testGameModule.id}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(completeGameModuleRequest);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      const responseBody = response.body as CompleteGameModuleResponse;
      expect(responseBody.isCorrect).toBe(false);
      expect(responseBody.feedback).toBe('Not quite right.');
      expect(responseBody.nextGameModuleId).toBeNull();
      expect(responseBody.currentGameModuleIndex).toBe(0);
      expect(responseBody.totalGameModules).toBe(1);

      const progression =
        await progressionRepository.findByUserIdAndGameModuleId(
          'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
          testGameModule.id,
        );
      expect(progression).toBeNull();
    });

    it('should return 404 when module does not exist', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const completeGameModuleRequest = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest('choice-1'),
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/modules/non-existent-module/complete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(completeGameModuleRequest);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Game module with id non-existent-module not found',
      );
    });

    it('should return 400 when choice does not exist', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);
      const lesson = LessonFactory.make({
        chapterId: chapter.id,
      });
      await lessonRepository.create(lesson);

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

      const testGameModule = new McqModule({
        id: 'module-456',
        lessonId: lesson.id,
        question: 'What is 2 + 2?',
        choices: choices,
      });

      await gameModuleRepository.create(testGameModule);

      const completeGameModuleRequest = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest('non-existent-choice'),
      );

      // When
      const response = await request(app.getHttpServer())
        .post(`/modules/${testGameModule.id}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(completeGameModuleRequest);

      // Then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toContain('Invalid answer');
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const completeGameModuleRequest = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest('choice-1'),
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/modules/module-id/complete')
        .send(completeGameModuleRequest);

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should allow student to complete game module', async () => {
      // Given
      const studentToken = generateAccessToken(UserType.STUDENT);
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);
      const lesson = LessonFactory.make({
        chapterId: chapter.id,
      });
      await lessonRepository.create(lesson);

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

      const testGameModule = new McqModule({
        id: 'module-456',
        lessonId: lesson.id,
        question: 'What is 2 + 2?',
        choices: choices,
      });

      await gameModuleRepository.create(testGameModule);

      const completeGameModuleRequest = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest('choice-1'),
      );

      // When
      const response = await request(app.getHttpServer())
        .post(`/modules/${testGameModule.id}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(completeGameModuleRequest);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      const responseBody = response.body as CompleteGameModuleResponse;
      expect(responseBody.isCorrect).toBe(true);
      expect(responseBody.nextGameModuleId).toBeNull();
      expect(responseBody.currentGameModuleIndex).toBe(0);
      expect(responseBody.totalGameModules).toBe(1);
    });
  });

  afterAll(async () => {
    await app.close();
  });

  function generateAccessToken(userType: UserType): string {
    return tokenService.generateAccessToken({
      id: 'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
      email: 'test@ritchie-invest.com',
      type: userType,
    });
  }
});
