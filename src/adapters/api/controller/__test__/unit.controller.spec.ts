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
import { UnitRepository } from '../../../../core/domain/repository/unit.repository';
import { GetUnitsByChapterIdResponse } from '../../response/get-units-by-chapter.response';
import { CreateUnitRequest } from '../../request/create-unit.request';
import { ChapterRepository } from '../../../../core/domain/repository/chapter.repository';
import { UpdateUnitRequest } from '../../request/update-unit.request';

describe('UnitControllerIT', () => {
  let app: INestApplication<App>;
  let chapterRepository: ChapterRepository;
  let unitRepository: UnitRepository;
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
    unitRepository = app.get(UnitRepository);
    tokenService = app.get('TokenService');

    await unitRepository.removeAll();
    await chapterRepository.removeAll();
  });

  afterEach(async () => {
    await unitRepository.removeAll();
    await chapterRepository.removeAll();
  });

  describe('getUnitsByChapterId', () => {
    it('should return units', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      };
      await chapterRepository.create(chapter);
      const unit1 = {
        title: 'Unit 1',
        description: 'Description of Unit 1',
        isPublished: true,
        chapterId: 'chapter-1',
      };
      await unitRepository.create(unit1);
      const unit2 = {
        title: 'Unit 2',
        description: 'Description of Unit 2',
        isPublished: false,
        chapterId: 'chapter-1',
      };
      await unitRepository.create(unit2);

      // When
      const response = await request(app.getHttpServer())
        .get(`/units/chapter/${chapter.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as GetUnitsByChapterIdResponse;
      expect(Array.isArray(responseBody.units)).toBe(true);
      expect(responseBody.units.length).toBe(2);
      expect(responseBody.units?.[0]).toMatchObject({
        title: 'Unit 1',
        description: 'Description of Unit 1',
        isPublished: true,
        chapterId: 'chapter-1',
      });
      expect(responseBody.units?.[1]).toMatchObject({
        title: 'Unit 2',
        description: 'Description of Unit 2',
        isPublished: false,
        chapterId: 'chapter-1',
      });
    });

    it('should return 401 if not authenticated', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/units/chapter/existing-chapter-id',
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
        .get('/units/chapter/existing-chapter-id')
        .set('Authorization', `Bearer ${userToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('getUnitById', () => {
    it('should return unit by id', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      };
      await chapterRepository.create(chapter);
      const unit = {
        title: 'Unit 1',
        description: 'Description of Unit 1',
        isPublished: true,
        chapterId: 'chapter-1',
      };
      const createdUnit = await unitRepository.create(unit);

      // When
      const response = await request(app.getHttpServer())
        .get(`/units/${createdUnit.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: createdUnit.id,
        title: 'Unit 1',
        description: 'Description of Unit 1',
        isPublished: true,
        chapterId: 'chapter-1',
      });
    });

    it('should return 404 if unit not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);

      // When
      const response = await request(app.getHttpServer())
        .get('/units/non-existing-id')
        .set('Authorization', `Bearer ${adminToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Unit with id non-existing-id not found',
      );
    });

    it('should return 401 if not authenticated', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/units/existing-id',
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
        .get('/units/existing-id')
        .set('Authorization', `Bearer ${userToken}`);

      // Then
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with type STUDENT does not have the required roles',
      );
    });
  });

  describe('createUnit', () => {
    it('should create a unit', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      };
      await chapterRepository.create(chapter);
      const unit = new CreateUnitRequest(
        'New Unit',
        'Description of New Unit',
        'chapter-1',
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(unit);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchObject({
        title: 'New Unit',
        description: 'Description of New Unit',
        isPublished: false,
        chapterId: 'chapter-1',
      });
    });

    it('should return 400 if unit data is invalid', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const createUnitRequest = new CreateUnitRequest(
        '',
        'Description of New Unit',
        'chapter-1',
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUnitRequest);

      // Then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toContain('Title is required');
    });

    it('should return 401 if not authenticated', async () => {
      // Given
      const createUnitRequest = new CreateUnitRequest(
        'New Unit',
        'Description of New Unit',
        'chapter-1',
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/units')
        .send(createUnitRequest);

      // Then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 403 if user does not have admin role', async () => {
      // Given
      const userToken = generateAccessToken(UserType.STUDENT);
      const createUnitRequest = new CreateUnitRequest(
        'New Unit',
        'Description of New Unit',
        'chapter-1',
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createUnitRequest);

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
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'Description of Chapter 1',
        isPublished: true,
      };
      await chapterRepository.create(chapter);
      const unit = {
        title: 'Unit 1',
        description: 'Description of Unit 1',
        isPublished: true,
        chapterId: 'chapter-1',
      };
      const createdUnit = await unitRepository.create(unit);
      const updateUnitRequest = new UpdateUnitRequest(
        'Updated Unit 1',
        'Updated Description of Unit 1',
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/units/${createdUnit.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateUnitRequest);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: createdUnit.id,
        title: 'Updated Unit 1',
        description: 'Updated Description of Unit 1',
        isPublished: false,
        chapterId: 'chapter-1',
      });
    });

    it('should return 404 if chapter not found', async () => {
      // Given
      const adminToken = generateAccessToken(UserType.ADMIN);
      const updateUnitRequest = new UpdateUnitRequest(
        'Updated Unit 1',
        'Updated Description of Unit 1',
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch('/units/non-existing-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateUnitRequest);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Unit with id non-existing-id not found',
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
      const unit = {
        title: 'Unit 1',
        description: 'Description of Unit 1',
        isPublished: true,
        chapterId: 'chapter-1',
      };
      const createdUnit = await unitRepository.create(unit);
      const updateUnitRequest = new UpdateUnitRequest(
        'Updated Unit 1',
        'Updated Description of Unit 1',
        false,
      );

      // When
      const response = await request(app.getHttpServer())
        .patch(`/units/${createdUnit.id}`)
        .send(updateUnitRequest);

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
        .patch('/units/non-existing-id')
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
