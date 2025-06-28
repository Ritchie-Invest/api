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
import { GameRepository } from '../../../../core/domain/repository/game.repository';
import { GetGamesByLessonIdResponse } from '../../response/get-games-by-lesson.response';
import { CreateGameRequest } from '../../request/create-game.request';
import { LessonRepository } from '../../../../core/domain/repository/lesson.repository';
import { UpdateGameRequest } from '../../request/update-game.request';
import { GameType } from '../../../../core/domain/type/Game/GameType';
import { GameRules } from '../../../../core/domain/type/Game/GameRules';
import { Question } from '../../../../core/domain/type/Game/Question';
import { QcmQuestion, QcmOption } from '../../../../core/domain/type/Game/Questions/QCM';

describe('GameControllerIT', () => {
  let app: INestApplication<App>;
  let lessonRepository: LessonRepository;
  let gameRepository: GameRepository;
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
    lessonRepository = app.get(LessonRepository);
    gameRepository = app.get(GameRepository);
    tokenService = app.get('TokenService');

    await gameRepository.removeAll();
    await lessonRepository.removeAll();
  });

  afterEach(async () => {
    await gameRepository.removeAll();
    await lessonRepository.removeAll();
  });

  describe('getGamesByLessonId', () => {
    it('should return games', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const lesson = {
        id: 'lesson-1',
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      };
      await lessonRepository.create(lesson);
      
      const mockRules: GameRules = {
        shuffle_questions: true,
        time_limit_seconds: 60,
      };
      
      const mockQuestions: Question[] = [createMockQcmQuestion()];

      const game1 = {
        type: GameType.QCM,
        rules: mockRules,
        questions: mockQuestions,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: true,
      };
      await gameRepository.create(game1);
      
      const game2 = {
        type: GameType.TRUE_OR_FALSE,
        rules: mockRules,
        questions: mockQuestions,
        lessonId: 'lesson-1',
        order: 2,
        isPublished: false,
      };
      await gameRepository.create(game2);

      // When
      const response = await request(app.getHttpServer())
        .get(`/games/lesson/${lesson.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetGamesByLessonIdResponse;
      expect(Array.isArray(responseBody.games)).toBe(true);
      expect(responseBody.games.length).toBe(2);
      expect(responseBody.games?.[0]).toMatchObject({
        type: GameType.QCM,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: true,
      });
      expect(responseBody.games?.[1]).toMatchObject({
        type: GameType.TRUE_OR_FALSE,
        lessonId: 'lesson-1',
        order: 2,
        isPublished: false,
      });
    });

    it('should return 401 if not authenticated', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/games/lesson/existing-lesson-id',
      );

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

   

  describe('getGameById', () => {
    it('should return game by id', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const lesson = {
        id: 'lesson-1',
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      };
      await lessonRepository.create(lesson);
      
      const mockRules: GameRules = {
        shuffle_questions: true,
        time_limit_seconds: 60,
      };
      
      const mockQuestions: Question[] = [createMockQcmQuestion()];

      const game = {
        type: GameType.QCM,
        rules: mockRules,
        questions: mockQuestions,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: true,
      };
      const createdGame = await gameRepository.create(game);

      // When
      const response = await request(app.getHttpServer())
        .get(`/games/${createdGame.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: createdGame.id,
        type: GameType.QCM,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: true,
      });
    });

    it('should return 404 if game not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);

      // When
      const response = await request(app.getHttpServer())
        .get('/games/non-existing-id')
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Game with id non-existing-id not found',
      );
    });

    it('should return 401 if not authenticated', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/games/existing-id',
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
        .get('/games/existing-id')
        .set('Authorization', `Bearer ${userToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('createGame', () => {
    it('should create a game', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const lesson = {
        id: 'lesson-1',
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      };
      await lessonRepository.create(lesson);
      
      const mockRules: GameRules = {
        shuffle_questions: true,
        time_limit_seconds: 60,
      };
      
      const mockQuestions: Question[] = [createMockQcmQuestion()];

      const game = new CreateGameRequest(
        GameType.QCM,
        mockRules,
        mockQuestions,
        'lesson-1',
        1,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(game);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchObject({
        type: GameType.QCM,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: false,
      });
    });

    it('should return 400 if game data is invalid', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const createGameRequest = new CreateGameRequest(
        '' as GameType,
        {} as GameRules,
        [],
        'lesson-1',
        1,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createGameRequest);

      // Then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const mockRules: GameRules = {
        shuffle_questions: true,
        time_limit_seconds: 60,
      };
      
      const mockQuestions: Question[] = [createMockQcmQuestion()];

      const createGameRequest = new CreateGameRequest(
        GameType.QCM,
        mockRules,
        mockQuestions,
        'lesson-1',
        1,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/games')
        .send(createGameRequest);

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 403 if user does not have admin role', async () => {
      // Given
      const userToken = generateAccessToken(UserType.STUDENT);
      const mockRules: GameRules = {
        shuffle_questions: true,
        time_limit_seconds: 60,
      };
      
      const mockQuestions: Question[] = [createMockQcmQuestion()];

      const createGameRequest = new CreateGameRequest(
        GameType.QCM,
        mockRules,
        mockQuestions,
        'lesson-1',
        1,
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createGameRequest);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('updateGame', () => {
    it('should update a game', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const lesson = {
        id: 'lesson-1',
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      };
      await lessonRepository.create(lesson);
      
      const mockRules: GameRules = {
        shuffle_questions: true,
        time_limit_seconds: 60,
      };
      
      const mockQuestions: Question[] = [createMockQcmQuestion()];

      const game = {
        type: GameType.QCM,
        rules: mockRules,
        questions: mockQuestions,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: false,
      };
      const createdGame = await gameRepository.create(game);
      
      const updatedRules: GameRules = {
        shuffle_questions: false,
        time_limit_seconds: 120,
      };

      const updateGameRequest = new UpdateGameRequest(
        GameType.TRUE_OR_FALSE,
        updatedRules,
        mockQuestions,
        true,
        2,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/games/${createdGame.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateGameRequest);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: createdGame.id,
        type: GameType.TRUE_OR_FALSE,
        lessonId: 'lesson-1',
        order: 2,
        isPublished: true,
      });
    });

    it('should return 404 if game not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const mockRules: GameRules = {
        shuffle_questions: true,
        time_limit_seconds: 60,
      };
      
      const mockQuestions: Question[] = [createMockQcmQuestion()];

      const updateGameRequest = new UpdateGameRequest(
        GameType.TRUE_OR_FALSE,
        mockRules,
        mockQuestions,
        true,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch('/games/non-existing-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateGameRequest);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Game with id non-existing-id not found',
      );
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const lesson = {
        id: 'lesson-1',
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        isPublished: true,
        chapterId: 'chapter-1',
        order: 1,
      };
      await lessonRepository.create(lesson);
      
      const mockRules: GameRules = {
        shuffle_questions: true,
        time_limit_seconds: 60,
      };
      
      const mockQuestions: Question[] = [createMockQcmQuestion()];

      const game = {
        type: GameType.QCM,
        rules: mockRules,
        questions: mockQuestions,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: false,
      };
      const createdGame = await gameRepository.create(game);
      
      const updateGameRequest = new UpdateGameRequest(
        GameType.TRUE_OR_FALSE,
        mockRules,
        mockQuestions,
        true,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/games/${createdGame.id}`)
        .send(updateGameRequest);

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
        .patch('/games/non-existing-id')
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

  function createMockQcmQuestion(): QcmQuestion {
    const options: QcmOption[] = [
      { value: '3', is_valid: false },
      { value: '4', is_valid: true },
      { value: '5', is_valid: false },
    ];
    
    return {
      question: 'What is 2+2?',
      options: options,
      feedback: 'The correct answer is 4',
    };
  }
});
