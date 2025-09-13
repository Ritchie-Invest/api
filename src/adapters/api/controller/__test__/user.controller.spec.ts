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
import { UserRepository } from '../../../../core/domain/repository/user.repository';
import { UpdateUserTypeRequest } from '../../request/update-user-type.request';
import { AppModule } from '../../../../app.module';
import { UserFactory } from './utils/user.factory';
import { ChapterRepository } from '../../../../core/domain/repository/chapter.repository';
import { LessonRepository } from '../../../../core/domain/repository/lesson.repository';
import { GameModuleRepository } from '../../../../core/domain/repository/game-module.repository';
import { LessonAttemptRepository } from '../../../../core/domain/repository/lesson-attempt.repository';
import { ModuleAttemptRepository } from '../../../../core/domain/repository/module-attempt.repository';
import { LessonCompletionRepository } from '../../../../core/domain/repository/lesson-completion.repository';
import { ChapterFactory } from './utils/chapter.factory';
import { LessonFactory } from './utils/lesson.factory';
import { McqModule } from '../../../../core/domain/model/McqModule';
import { McqChoice } from '../../../../core/domain/model/McqChoice';
import { LessonAttempt } from '../../../../core/domain/model/LessonAttempt';
import { ModuleAttempt } from '../../../../core/domain/model/ModuleAttempt';
import { LessonCompletion } from '../../../../core/domain/model/LessonCompletion';
import { GetUserProgressResponse } from '../../response/get-user-progress.response';
import { LessonStatus } from '../../../../core/domain/type/LessonStatus';
import { ChapterStatus } from '../../../../core/domain/type/ChapterStatus';

describe('UserControllerIT', () => {
  let app: INestApplication<App>;
  let userRepository: UserRepository;
  let tokenService: TokenService;

  let chapterRepository: ChapterRepository;
  let lessonRepository: LessonRepository;
  let gameModuleRepository: GameModuleRepository;
  let lessonAttemptRepository: LessonAttemptRepository;
  let moduleAttemptRepository: ModuleAttemptRepository;
  let lessonCompletionRepository: LessonCompletionRepository;

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
    userRepository = app.get(UserRepository);
    tokenService = app.get('TokenService');

    chapterRepository = app.get(ChapterRepository);
    lessonRepository = app.get(LessonRepository);
    gameModuleRepository = app.get(GameModuleRepository);
    lessonAttemptRepository = app.get('LessonAttemptRepository');
    moduleAttemptRepository = app.get('ModuleAttemptRepository');
    lessonCompletionRepository = app.get('LessonCompletionRepository');

    await lessonCompletionRepository.removeAll();
    await moduleAttemptRepository.removeAll();
    await lessonAttemptRepository.removeAll();
    await gameModuleRepository.removeAll();
    await lessonRepository.removeAll();
    await chapterRepository.removeAll();
    await userRepository.removeAll();
  });

  afterEach(async () => {
    await lessonCompletionRepository.removeAll();
    await moduleAttemptRepository.removeAll();
    await lessonAttemptRepository.removeAll();
    await gameModuleRepository.removeAll();
    await lessonRepository.removeAll();
    await chapterRepository.removeAll();
    await userRepository.removeAll();
  });

  describe('updateUserType', () => {
    it('should update user type successfully', async () => {
      // Given
      const accessToken = generateAccessToken(UserType.SUPERADMIN);
      const existingUser = UserFactory.make({
        id: 'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
      });
      await userRepository.create(existingUser);
      const updateUserTypeRequest: UpdateUserTypeRequest = {
        type: UserType.ADMIN,
      };

      // When
      const response = await request(app.getHttpServer())
        .patch(`/users/${existingUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserTypeRequest);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        id: existingUser.id,
        email: existingUser.email,
        type: UserType.ADMIN,
        createdAt: existingUser.createdAt.toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updatedAt: expect.any(String),
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Given
      const existingUser = UserFactory.make({
        id: 'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
      });
      await userRepository.create(existingUser);
      const updateUserTypeRequest: UpdateUserTypeRequest = {
        type: UserType.ADMIN,
      };

      // When
      const response = await request(app.getHttpServer())
        .patch(`/users/${existingUser.id}`)
        .send(updateUserTypeRequest);

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 403 if user is not a superadmin', async () => {
      // Given
      const accessToken = generateAccessToken(UserType.STUDENT);
      const existingUser = UserFactory.make({
        id: 'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
      });
      await userRepository.create(existingUser);
      const updateUserTypeRequest: UpdateUserTypeRequest = {
        type: UserType.ADMIN,
      };

      // When
      const response = await request(app.getHttpServer())
        .patch(`/users/${existingUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserTypeRequest);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });

    it('should return 404 if user does not exist', async () => {
      // Given
      const accessToken = generateAccessToken(UserType.SUPERADMIN);
      const nonExistentUserId = 'non-existent-user-id';
      const updateUserTypeRequest: UpdateUserTypeRequest = {
        type: UserType.ADMIN,
      };

      // When
      const response = await request(app.getHttpServer())
        .patch(`/users/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserTypeRequest);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with email non-existent-user-id not found',
      );
    });
  });

  describe('getMe', () => {
    it("should return current user's profile", async () => {
      // Given
      const accessToken = generateAccessToken(UserType.STUDENT);
      const existingUser = UserFactory.make({
        id: 'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
        email: 'test@ritchie-invest.com',
        totalXp: 42,
      });
      await userRepository.create(existingUser);

      // When
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        id: existingUser.id,
        email: existingUser.email,
        totalXp: 42,
        level: 3,
        xpRequiredForNextLevel: 25,
        xpForThisLevel: 17,
        isInvestmentUnlocked: false,
        levelRequiredToUnlockInvestment: 5,
        // Champs de gestion des vies ajoutés par LifeService
        life_number: 5,
        next_life_in: 0,
        has_lost: false,
      });
    });

    it('should return 401 if no token provided', async () => {
      // When
      const response = await request(app.getHttpServer()).get('/users/me');

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 404 if user not found', async () => {
      // Given
      const accessToken = generateAccessToken(UserType.STUDENT);

      // When
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with email be7cbc6d-782b-4939-8cff-e577dfe3e79a not found',
      );
    });
  });

  describe('getUserProgress', () => {
    beforeEach(async () => {
      await userRepository.create({
        id: 'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
        email: 'test@ritchie-invest.com',
        password: 'hashedPassword123',
        type: UserType.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('should return user chapters with progress', async () => {
      // Given
      const studentToken = generateAccessToken(UserType.STUDENT);

      const user = UserFactory.make({
        id: 'be7cbc6d-782b-4939-8cff-e577dfe3e79a',
      });

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

      const lessonAttempt1 = new LessonAttempt(
        'lesson-attempt-1',
        user.id,
        lesson1.id,
        new Date(),
      );
      await lessonAttemptRepository.create(lessonAttempt1);

      const moduleAttempt1 = new ModuleAttempt(
        'module-attempt-1',
        user.id,
        module1.id,
        lessonAttempt1.id,
        true,
        new Date(),
      );
      await moduleAttemptRepository.create(moduleAttempt1);
      const moduleAttempt2 = new ModuleAttempt(
        'module-attempt-2',
        user.id,
        module2.id,
        lessonAttempt1.id,
        true,
        new Date(),
      );
      await moduleAttemptRepository.create(moduleAttempt2);

      const lessonCompletion1 = new LessonCompletion(
        'lesson-completion-1',
        user.id,
        lesson1.id,
        2,
        new Date(),
      );
      await lessonCompletionRepository.create(lessonCompletion1);

      // When
      const response = await request(app.getHttpServer())
        .get('/users/progress')
        .set('Authorization', `Bearer ${studentToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetUserProgressResponse;

      expect(responseBody).toStrictEqual({
        chapters: [
          {
            id: chapter1.id,
            title: chapter1.title,
            description: chapter1.description,
            order: chapter1.order,
            status: ChapterStatus.IN_PROGRESS,
            completedLessons: 1,
            totalLessons: 2,
            lessons: [
              {
                id: lesson1.id,
                title: lesson1.title,
                description: lesson1.description,
                order: lesson1.order,
                status: LessonStatus.COMPLETED,
                gameModuleId: 'module-1',
              },
              {
                id: lesson2.id,
                title: lesson2.title,
                description: lesson2.description,
                order: lesson2.order,
                status: LessonStatus.UNLOCKED,
                gameModuleId: 'module-3',
              },
            ],
          },
          {
            id: chapter2.id,
            title: chapter2.title,
            description: chapter2.description,
            order: chapter2.order,
            status: ChapterStatus.LOCKED,
            completedLessons: 0,
            totalLessons: 1,
            lessons: [
              {
                id: lesson3.id,
                title: lesson3.title,
                description: lesson3.description,
                order: lesson3.order,
                status: LessonStatus.LOCKED,
                gameModuleId: 'module-4',
              },
            ],
          },
        ],
      });
    });

    it('should return empty chapters array when no chapters exist', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);

      // When
      const response = await request(app.getHttpServer())
        .get('/users/progress')
        .set('Authorization', `Bearer ${adminToken}`);
      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetUserProgressResponse;
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
        .get('/users/progress')
        .set('Authorization', `Bearer ${adminToken}`);
      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetUserProgressResponse;
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
        '/users/progress',
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
        .get('/users/progress')
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
