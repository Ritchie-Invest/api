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
import { LessonRepository } from '../../../../core/domain/repository/lesson.repository';
import { GetLessonsByChapterIdResponse } from '../../response/get-lessons-by-chapter.response';
import { CreateLessonRequest } from '../../request/create-lesson.request';
import { ChapterRepository } from '../../../../core/domain/repository/chapter.repository';
import { Chapter } from '../../../../core/domain/model/Chapter';
import { Lesson } from '../../../../core/domain/model/Lesson';
import { UpdateLessonRequest } from '../../request/update-lesson.request';
import { GameType } from '../../../../core/domain/type/GameType';
import { CreateGameModuleRequest } from '../../request/create-game-module.request';
import { GameModuleRepository } from '../../../../core/domain/repository/game-module.repository';
import { AppModule } from '../../../../app.module';
import { McqModule } from '../../../../core/domain/model/McqModule';
import { Progression } from '../../../../core/domain/model/Progression';
import { ProgressionRepository } from '../../../../core/domain/repository/progression.repository';
import { UserRepository } from '../../../../core/domain/repository/user.repository';
import { User } from '../../../../core/domain/model/User';

describe('LessonControllerIT', () => {
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
  });

  afterEach(async () => {
    await progressionRepository.removeAll();
    await gameModuleRepository.removeAll();
    await lessonRepository.removeAll();
    await chapterRepository.removeAll();
    await userRepository.removeAll();
  });

  describe('getLessonsByChapterId', () => {
    it('should return lessons', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      await chapterRepository.create(chapter);
      const lesson1 = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
      );
      await lessonRepository.create(lesson1);
      const lesson2 = new Lesson(
        'lesson-2',
        'Lesson 2',
        'Description of Lesson 2',
        'chapter-1',
        2,
        false,
        GameType.MCQ,
      );
      await lessonRepository.create(lesson2);

      // When
      const response = await request(app.getHttpServer())
        .get(`/lessons/chapter/${chapter.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetLessonsByChapterIdResponse;
      expect(Array.isArray(responseBody.lessons)).toBe(true);
      expect(responseBody.lessons.length).toBe(2);
      expect(responseBody.lessons?.[0]).toMatchObject({
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      });
      expect(responseBody.lessons?.[1]).toMatchObject({
        title: 'Lesson 2',
        description: 'Description of Lesson 2',
        isPublished: false,
        chapterId: 'chapter-1',
        order: 2,
      });
    });

    it('should return 401 if not authenticated', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/lessons/chapter/existing-chapter-id',
      );

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 403 if user does not have admin role', async () => {
      // Given
      const userToken = generateAccessToken(UserType.STUDENT);

      // When
      const response = await request(app.getHttpServer())
        .get('/lessons/chapter/existing-chapter-id')
        .set('Authorization', `Bearer ${userToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('getLessonById', () => {
    it('should return lesson by id', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      await chapterRepository.create(chapter);
      const lesson = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
      );
      const createdLesson = await lessonRepository.create(lesson);

      // When
      const response = await request(app.getHttpServer())
        .get(`/lessons/${createdLesson.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: createdLesson.id,
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      });
    });

    it('should return 404 if lesson not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);

      // When
      const response = await request(app.getHttpServer())
        .get('/lessons/non-existing-id')
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Lesson with id non-existing-id not found',
      );
    });

    it('should return 401 if not authenticated', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/lessons/existing-id',
      );

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 403 if user does not have admin role', async () => {
      // Given
      const userToken = generateAccessToken(UserType.STUDENT);

      // When
      const response = await request(app.getHttpServer())
        .get('/lessons/existing-id')
        .set('Authorization', `Bearer ${userToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('createLesson', () => {
    it('should create a lesson', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      await chapterRepository.create(chapter);
      const lesson = new CreateLessonRequest(
        'New Lesson',
        'Description of New Lesson',
        'chapter-1',
        1,
        GameType.MCQ,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(lesson);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchObject({
        title: 'New Lesson',
        description: 'Description of New Lesson',
        isPublished: false,
        chapterId: 'chapter-1',
      });
    });

    it('should return 400 if lesson data is invalid', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const createLessonRequest = new CreateLessonRequest(
        '',
        'Description of New Lesson',
        'chapter-1',
        1,
        GameType.MCQ,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createLessonRequest);

      // Then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toContain('Title is required');
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const createLessonRequest = new CreateLessonRequest(
        'New Lesson',
        'Description of New Lesson',
        'chapter-1',
        1,
        GameType.MCQ,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/lessons')
        .send(createLessonRequest);

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 403 if user does not have admin role', async () => {
      // Given
      const userToken = generateAccessToken(UserType.STUDENT);
      const createLessonRequest = new CreateLessonRequest(
        'New Lesson',
        'Description of New Lesson',
        'chapter-1',
        1,
        GameType.MCQ,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createLessonRequest);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('updateChapter', () => {
    it('should update a chapter', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      await chapterRepository.create(chapter);
      const lesson = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
      );
      const createdLesson = await lessonRepository.create(lesson);
      const updateLessonRequest = new UpdateLessonRequest(
        'Updated Lesson 1',
        'Updated Description of Lesson 1',
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/lessons/${createdLesson.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateLessonRequest);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: createdLesson.id,
        title: 'Updated Lesson 1',
        description: 'Updated Description of Lesson 1',
        isPublished: false,
        chapterId: 'chapter-1',
      });
    });

    it('should return 404 if chapter not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const updateLessonRequest = new UpdateLessonRequest(
        'Updated Lesson 1',
        'Updated Description of Lesson 1',
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch('/lessons/non-existing-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateLessonRequest);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Lesson with id non-existing-id not found',
      );
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      await chapterRepository.create(chapter);
      const lesson = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
      );
      const createdLesson = await lessonRepository.create(lesson);
      const updateLessonRequest = new UpdateLessonRequest(
        'Updated Lesson 1',
        'Updated Description of Lesson 1',
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/lessons/${createdLesson.id}`)
        .send(updateLessonRequest);

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 403 if user does not have admin role', async () => {
      // Given
      const userToken = generateAccessToken(UserType.STUDENT);

      // When
      const response = await request(app.getHttpServer())
        .patch('/lessons/non-existing-id')
        .set('Authorization', `Bearer ${userToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('createGameModule', () => {
    it('should create a game module for a lesson', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      await chapterRepository.create(chapter);
      const lesson = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
      );
      const createdLesson = await lessonRepository.create(lesson);
      const createGameModuleRequest = new CreateGameModuleRequest(
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
        .post(`/lessons/${createdLesson.id}/modules`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createGameModuleRequest);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchObject({
        id: createdLesson.id,
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
        gameType: GameType.MCQ,
        modules: [
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            id: expect.any(String),
            lessonId: createdLesson.id,
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
        .post('/lessons/non-existing-id/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ gameType: GameType.MCQ });

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Lesson with id non-existing-id not found',
      );
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      await chapterRepository.create(chapter);
      const lesson = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
      );
      const createdLesson = await lessonRepository.create(lesson);

      // When
      const response = await request(app.getHttpServer())
        .post(`/lessons/${createdLesson.id}/modules`)
        .send({ gameType: GameType.MCQ });

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('completeLesson', () => {
    it('should complete a lesson', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const user = new User(
        'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
        'test@ritchie.com',
        'password',
        UserType.STUDENT,
      );
      await userRepository.create(user);
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      await chapterRepository.create(chapter);
      const lesson = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
      );
      const createdLesson = await lessonRepository.create(lesson);
      const gameModule1 = new McqModule({
        id: 'module-1',
        lessonId: createdLesson.id,
        question: 'What is the capital of France?',
        choices: [
          {
            id: 'choice-1',
            text: 'Paris',
            isCorrect: true,
            correctionMessage: 'Correct! Paris is the capital of France.',
          },
          {
            id: 'choice-2',
            text: 'London',
            isCorrect: false,
            correctionMessage:
              'Incorrect! London is not the capital of France.',
          },
        ],
      });
      await gameModuleRepository.create(gameModule1);
      const gameModule2 = new McqModule({
        id: 'module-2',
        lessonId: createdLesson.id,
        question: 'What is 2+2?',
        choices: [
          {
            id: 'choice-3',
            text: '3',
            isCorrect: false,
            correctionMessage: 'No, try again.',
          },
          {
            id: 'choice-4',
            text: '4',
            isCorrect: true,
            correctionMessage: 'Yes, that is correct!',
          },
        ],
      });
      await gameModuleRepository.create(gameModule2);
      const gameModule3 = new McqModule({
        id: 'module-3',
        lessonId: createdLesson.id,
        question: 'What is 3+3?',
        choices: [
          {
            id: 'choice-5',
            text: '6',
            isCorrect: true,
            correctionMessage: 'Correct! 3+3 equals 6.',
          },
          {
            id: 'choice-6',
            text: '7',
            isCorrect: false,
            correctionMessage: 'Incorrect, try again.',
          },
        ],
      });
      await gameModuleRepository.create(gameModule3);
      const progression = new Progression(
        'progression-1',
        'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
        gameModule1.id,
        true,
      );
      await progressionRepository.create(progression);

      // When
      const response = await request(app.getHttpServer())
        .post(`/lessons/${createdLesson.id}/complete`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchObject({
        score: 1,
        totalGameModules: 3,
      });
    });

    it('should return 404 if lesson not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);

      // When
      const response = await request(app.getHttpServer())
        .post('/lessons/non-existing-id/complete')
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Lesson with id non-existing-id not found',
      );
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
