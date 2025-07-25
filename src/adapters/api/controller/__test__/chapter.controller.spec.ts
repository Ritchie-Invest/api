import { ChapterRepository } from '../../../../core/domain/repository/chapter.repository';
import { McqModule } from '../../../../core/domain/model/McqModule';
import { McqChoice } from '../../../../core/domain/model/McqChoice';
import { Progression } from '../../../../core/domain/model/Progression';
import { Test, TestingModule } from '@nestjs/testing';

import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { DomainErrorFilter } from '../../../../config/domain-error.filter';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { GetChaptersResponse } from '../../response/get-chapters.response';
import { CreateChapterRequest } from '../../request/create-chapter.request';
import { TokenService } from '../../../../core/domain/service/token.service';
import { UserType } from '../../../../core/domain/type/UserType';
import { UpdateChapterRequest } from '../../request/update-chapter.request';
import { UserRepository } from '../../../../core/domain/repository/user.repository';
import { GameModuleRepository } from '../../../../core/domain/repository/game-module.repository';
import { LessonRepository } from '../../../../core/domain/repository/lesson.repository';
import { ProgressionRepository } from '../../../../core/domain/repository/progression.repository';
import { GetUserChaptersResponse } from '../../response/get-user-chapters.response';
import { AppModule } from '../../../../app.module';
import { ChapterFactory } from './utils/chapter.factory';
import { LessonFactory } from './utils/lesson.factory';

describe('ChapterControllerIT', () => {
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

  describe('getChapters', () => {
    it('should return chapters', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter1 = ChapterFactory.make({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        order: 0,
        isPublished: true,
      });
      await chapterRepository.create(chapter1);
      const chapter2 = ChapterFactory.make({
        id: 'chapter-2',
        title: 'Chapter 2',
        description: 'Description of Chapter 2',
        order: 1,
        isPublished: false,
      });
      await chapterRepository.create(chapter2);

      // When
      const response = await request(app.getHttpServer())
        .get('/chapters')
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetChaptersResponse;
      expect(Array.isArray(responseBody.chapters)).toBe(true);
      expect(responseBody.chapters.length).toBe(2);
      expect(responseBody.chapters?.[0]).toMatchObject({
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      });
      expect(responseBody.chapters?.[1]).toMatchObject({
        title: 'Chapter 2',
        description: 'Description of Chapter 2',
        isPublished: false,
      });
    });

    it('should return 401 if not authenticated', async () => {
      // When
      const response = await request(app.getHttpServer()).get('/chapters');

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
        .get('/chapters')
        .set('Authorization', `Bearer ${userToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('getChapterById', () => {
    it('should return chapter by id', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);

      // When
      const response = await request(app.getHttpServer())
        .get(`/chapters/${chapter.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        order: chapter.order,
        isPublished: chapter.isPublished,
        createdAt: chapter.createdAt.toISOString(),
        updatedAt: chapter.updatedAt.toISOString(),
      });
    });

    it('should return 404 if chapter not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);

      // When
      const response = await request(app.getHttpServer())
        .get('/chapters/non-existing-id')
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Chapter with id non-existing-id not found',
      );
    });

    it('should return 401 if not authenticated', async () => {
      // When
      const response = await request(app.getHttpServer()).get('/chapters/1');

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
        .get('/chapters/1')
        .set('Authorization', `Bearer ${userToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('createChapter', () => {
    it('should create a chapter', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const createChapterRequest = new CreateChapterRequest(
        'New Chapter',
        'Description of New Chapter',
        0,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/chapters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createChapterRequest);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchObject({
        title: 'New Chapter',
        description: 'Description of New Chapter',
        isPublished: false,
      });
    });

    it('should return 400 if chapter data is invalid', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const createChapterRequest = new CreateChapterRequest(
        '',
        'Description of New Chapter',
        0,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/chapters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createChapterRequest);

      // Then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toContain('Title is required');
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const createChapterRequest = new CreateChapterRequest(
        'New Chapter',
        'Description of New Chapter',
        0,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/chapters')
        .send(createChapterRequest);

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 403 if user does not have admin role', async () => {
      // Given
      const userToken = generateAccessToken(UserType.STUDENT);
      const createChapterRequest = new CreateChapterRequest(
        'New Chapter',
        'Description of New Chapter',
        0,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/chapters')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createChapterRequest);

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
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);
      const updateChapterRequest = new UpdateChapterRequest(
        'Updated Chapter 1',
        'Updated Description of Chapter 1',
        1,
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/chapters/${chapter.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateChapterRequest);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: chapter.id,
        title: 'Updated Chapter 1',
        description: 'Updated Description of Chapter 1',
        order: 1,
        isPublished: false,
      });
    });

    it('should return 404 if chapter not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const updateChapterRequest = new UpdateChapterRequest(
        'Updated Chapter 1',
        'Updated Description of Chapter 1',
        1,
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch('/chapters/non-existing-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateChapterRequest);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Chapter with id non-existing-id not found',
      );
    });

    it('should return 400 if chapter data is invalid', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);
      const updateChapterRequest = new UpdateChapterRequest(
        '',
        'Updated Description of Chapter 1',
        1,
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/chapters/${chapter.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateChapterRequest);

      // Then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toContain('Title is required');
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const chapter = ChapterFactory.make();
      await chapterRepository.create(chapter);
      const updateChapterRequest = new UpdateChapterRequest(
        'Updated Chapter 1',
        'Updated Description of Chapter 1',
        1,
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/chapters/${chapter.id}`)
        .send(updateChapterRequest);

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
        .patch('/chapters/non-existing-id')
        .set('Authorization', `Bearer ${userToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('getUserChapters', () => {
    it('should return user chapters with progress', async () => {
      // Given
      const studentToken = generateAccessToken(UserType.STUDENT);

      const chapter1 = ChapterFactory.make();
      await chapterRepository.create(chapter1);
      const chapter2 = ChapterFactory.make();
      await chapterRepository.create(chapter2);

      const lesson1 = LessonFactory.make({
        chapterId: chapter1.id,
      });
      await lessonRepository.create(lesson1);
      const lesson2 = LessonFactory.make({
        chapterId: chapter1.id,
      });
      await lessonRepository.create(lesson2);
      const lesson3 = LessonFactory.make({
        chapterId: chapter2.id,
      });
      await lessonRepository.create(lesson3);

      const module1 = new McqModule({
        id: 'module-1',
        lessonId: lesson1.id,
        question: 'What is 2+2?',
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
            correctionMessage: 'Incorrect',
          }),
        ],
      });

      const module2 = new McqModule({
        id: 'module-2',
        lessonId: lesson1.id,
        question: 'What is 3+3?',
        choices: [
          new McqChoice({
            id: 'choice-3',
            text: '6',
            isCorrect: true,
            correctionMessage: 'Correct!',
          }),
          new McqChoice({
            id: 'choice-8',
            text: '7',
            isCorrect: false,
            correctionMessage: 'Incorrect',
          }),
        ],
      });

      const module3 = new McqModule({
        id: 'module-3',
        lessonId: lesson2.id,
        question: 'What is 5+5?',
        choices: [
          new McqChoice({
            id: 'choice-4',
            text: '10',
            isCorrect: true,
            correctionMessage: 'Correct!',
          }),
          new McqChoice({
            id: 'choice-7',
            text: '11',
            isCorrect: false,
            correctionMessage: 'Incorrect',
          }),
        ],
      });

      const module4 = new McqModule({
        id: 'module-4',
        lessonId: lesson3.id,
        question: 'What is 7+7?',
        choices: [
          new McqChoice({
            id: 'choice-5',
            text: '14',
            isCorrect: true,
            correctionMessage: 'Correct!',
          }),
          new McqChoice({
            id: 'choice-6',
            text: '15',
            isCorrect: false,
            correctionMessage: 'Incorrect',
          }),
        ],
      });

      await gameModuleRepository.create(module1);
      await gameModuleRepository.create(module2);
      await gameModuleRepository.create(module3);
      await gameModuleRepository.create(module4);

      await progressionRepository.create(
        new Progression(
          'prog-1',
          'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
          'module-1',
          true,
        ),
      );
      await progressionRepository.create(
        new Progression(
          'prog-2',
          'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
          'module-2',
          true,
        ),
      );
      await progressionRepository.create(
        new Progression(
          'prog-3',
          'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
          'module-3',
          false,
        ),
      );

      // When
      const response = await request(app.getHttpServer())
        .get('/chapters/user/progress')
        .set('Authorization', `Bearer ${studentToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetUserChaptersResponse;
      expect(Array.isArray(responseBody.chapters)).toBe(true);
      expect(responseBody.chapters).toHaveLength(2);

      const chapter1Response = responseBody.chapters[0];
      expect(chapter1Response).toMatchObject({
        id: chapter1.id,
        title: chapter1.title,
        description: chapter1.description,
        order: chapter1.order,
        isUnlocked: true,
        completedLessons: 1,
        totalLessons: 2,
      });
      expect(chapter1Response!.lessons).toHaveLength(2);

      const lesson1Response = chapter1Response!.lessons[0];
      expect(lesson1Response).toMatchObject({
        id: lesson1.id,
        title: lesson1.title,
        description: lesson1.description,
        order: lesson1.order,
        isUnlocked: true,
        completedModules: 2,
        totalModules: 2,
        gameModuleId: 'module-1',
      });

      const lesson2Response = chapter1Response!.lessons[1];
      expect(lesson2Response).toMatchObject({
        id: lesson2.id,
        title: lesson2.title,
        description: lesson2.description,
        order: lesson2.order,
        isUnlocked: true,
        completedModules: 0,
        totalModules: 1,
        gameModuleId: 'module-3',
      });

      const chapter2Response = responseBody.chapters[1];
      expect(chapter2Response).toMatchObject({
        id: chapter2.id,
        title: chapter2.title,
        description: chapter2.description,
        order: chapter2.order,
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 1,
      });

      const lesson3Response = chapter2Response!.lessons[0];
      expect(lesson3Response).toMatchObject({
        id: lesson3.id,
        title: lesson3.title,
        description: lesson3.description,
        order: lesson3.order,
        isUnlocked: false,
        completedModules: 0,
        totalModules: 1,
        gameModuleId: 'module-4',
      });
    });

    it('should return empty chapters array when no chapters exist', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);

      // When
      const response = await request(app.getHttpServer())
        .get('/chapters/user/progress')
        .set('Authorization', `Bearer ${adminToken}`);
      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetUserChaptersResponse;
      expect(Array.isArray(responseBody.chapters)).toBe(true);
      expect(responseBody.chapters).toHaveLength(0);
    });

    it('should return chapters ordered by order field', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter3 = ChapterFactory.make({
        id: 'chapter-3',
        title: 'Chapter 3',
        description: 'Description of Chapter 3',
        order: 3,
        isPublished: true,
      });
      const chapter1 = ChapterFactory.make({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        order: 1,
        isPublished: true,
      });
      const chapter2 = ChapterFactory.make({
        id: 'chapter-2',
        title: 'Chapter 2',
        description: 'Description of Chapter 2',
        order: 2,
        isPublished: true,
      });
      await chapterRepository.create(chapter3);
      await chapterRepository.create(chapter1);
      await chapterRepository.create(chapter2);

      // When
      const response = await request(app.getHttpServer())
        .get('/chapters/user/progress')
        .set('Authorization', `Bearer ${adminToken}`);
      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetUserChaptersResponse;
      expect(responseBody.chapters).toHaveLength(3);

      expect(responseBody.chapters[0]!.order).toBe(1);
      expect(responseBody.chapters[1]!.order).toBe(2);
      expect(responseBody.chapters[2]!.order).toBe(3);
      expect(responseBody.chapters[0]!.title).toBe('Chapter 1');
      expect(responseBody.chapters[1]!.title).toBe('Chapter 2');
      expect(responseBody.chapters[2]!.title).toBe('Chapter 3');
    });

    it('should return 401 if not authenticated', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/chapters/user/progress',
      );

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should not allow access for users with an invalid token', async () => {
      const invalidToken = 'invalid.jwt.token';

      // When
      const response = await request(app.getHttpServer())
        .get('/chapters/user/progress')
        .set('Authorization', `Bearer ${invalidToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
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
