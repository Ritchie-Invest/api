import { ChapterRepository } from '../../../../core/domain/repository/chapter.repository';
import { Chapter } from '../../../../core/domain/model/Chapter';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../../app.module';
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

    // Create a test user for progression tests
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
      const chapter1 = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      await chapterRepository.create(chapter1);
      const chapter2 = new Chapter(
        'chapter-2',
        'Chapter 2',
        'Description of Chapter 2',
        1,
        false,
      );
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
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      const createdChapter = await chapterRepository.create(chapter);

      // When
      const response = await request(app.getHttpServer())
        .get(`/chapters/${createdChapter.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: createdChapter.id,
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
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
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      const createdChapter = await chapterRepository.create(chapter);
      const updateChapterRequest = new UpdateChapterRequest(
        'Updated Chapter 1',
        'Updated Description of Chapter 1',
        1,
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/chapters/${createdChapter.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateChapterRequest);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: createdChapter.id,
        title: 'Updated Chapter 1',
        description: 'Updated Description of Chapter 1',
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
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        0,
        true,
      );
      const createdChapter = await chapterRepository.create(chapter);
      const updateChapterRequest = new UpdateChapterRequest(
        '',
        'Updated Description of Chapter 1',
        1,
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/chapters/${createdChapter.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateChapterRequest);

      // Then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toContain('Title is required');
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
      const createdChapter = await chapterRepository.create(chapter);
      const updateChapterRequest = new UpdateChapterRequest(
        'Updated Chapter 1',
        'Updated Description of Chapter 1',
        1,
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/chapters/${createdChapter.id}`)
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
      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        1,
        true,
      );
      await chapterRepository.create(chapter);

      // When
      const response = await request(app.getHttpServer())
        .get('/chapters/user/progress')
        .set('Authorization', `Bearer ${studentToken}`);
      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetUserChaptersResponse;
      expect(Array.isArray(responseBody.chapters)).toBe(true);
      expect(responseBody.chapters).toHaveLength(1);
      expect(responseBody.chapters[0]).toMatchObject({
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        order: 1,
        is_unlocked: true,
        completed_lessons: 0,
        total_lessons: 0,
        lessons: [],
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
      // Create chapters in reverse order
      const chapter3 = new Chapter(
        'chapter-3',
        'Chapter 3',
        'Description of Chapter 3',
        3,
        true,
      );
      const chapter1 = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        1,
        true,
      );
      const chapter2 = new Chapter(
        'chapter-2',
        'Chapter 2',
        'Description of Chapter 2',
        2,
        true,
      );
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

      // Should be ordered by order field
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
