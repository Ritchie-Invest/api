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

describe('UserControllerIT', () => {
  let app: INestApplication<App>;
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
    userRepository = app.get(UserRepository);
    tokenService = app.get('TokenService');

    await userRepository.removeAll();
  });

  afterEach(async () => {
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
