import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../../app.module';
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
import { getLessonsByChapterIdResponse } from '../../response/get-lessons-by-chapter.response';
import { CreateLessonRequest } from '../../request/create-lesson.request';
import { ChapterRepository } from '../../../../core/domain/repository/chapter.repository';
import { UpdateLessonRequest } from '../../request/update-lesson.request';

describe('LessonControllerIT', () => {
  let app: INestApplication<App>;
  let chapterRepository: ChapterRepository;
  let lessonRepository: LessonRepository;
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
    tokenService = app.get('TokenService');

    await lessonRepository.removeAll();
    await chapterRepository.removeAll();
  });

  afterEach(async () => {
    await lessonRepository.removeAll();
    await chapterRepository.removeAll();
  });

  describe('getLessonsByChapterId', () => {
    it('should return lessons', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      };
      await chapterRepository.create(chapter);
      const lesson1 = {
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      };
      await lessonRepository.create(lesson1);
      const lesson2 = {
        title: 'Lesson 2',
        description: 'Description of Lesson 2',
        isPublished: false,
        chapterId: 'chapter-1',
        order: 2,
      };
      await lessonRepository.create(lesson2);

      // When
      const response = await request(app.getHttpServer())
        .get(`/lessons/chapter/${chapter.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as getLessonsByChapterIdResponse;
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
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      };
      await chapterRepository.create(chapter);
      const lesson = {
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      };
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
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      };
      await chapterRepository.create(chapter);
      const lesson = new CreateLessonRequest(
        'New Lesson',
        'Description of New Lesson',
        'chapter-1',
        1
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
        1
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
    it('should update a lesson', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      };
      await chapterRepository.create(chapter);
      const lesson = {
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
      };
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

    it('should return 404 if lesson not found', async () => {
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
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      };
      await chapterRepository.create(chapter);
      const lesson = {
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      };
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
