import request from 'supertest';
import cookieParser from 'cookie-parser';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { DomainErrorFilter } from '../../../../config/domain-error.filter';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { UserType } from '../../../../core/domain/type/UserType';
import { UserRepository } from '../../../../core/domain/repository/user.repository';
import { RefreshTokenRepository } from '../../../../core/domain/repository/refresh-token.repository';
import { RegisterRequest } from '../../request/register.request';
import { RegisterResponse } from '../../response/register.response';
import { LoginResponse } from '../../response/login.response';
import { LoginRequest } from '../../request/login.request';
import { TokenService } from '../../../../core/domain/service/token.service';
import { AppModule } from '../../../../app.module';

describe('AuthControllerIT', () => {
  let app: INestApplication<App>;
  let userRepository: UserRepository;
  let refreshTokenRepository: RefreshTokenRepository;
  let tokenService: TokenService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
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
    refreshTokenRepository = app.get(RefreshTokenRepository);
    tokenService = app.get('TokenService');

    await refreshTokenRepository.removeAll();
    await userRepository.removeAll();
  });

  afterEach(async () => {
    await refreshTokenRepository.removeAll();
    await userRepository.removeAll();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      // Given
      const registerRequest = new RegisterRequest(
        'test@example.com',
        'password123',
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerRequest);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      const responseBody = response.body as RegisterResponse;
      expect(responseBody).toHaveProperty('id');
      expect(responseBody.email).toBe(registerRequest.email);
      expect(responseBody.type).toBe(UserType.STUDENT);
      expect(responseBody.createdAt).toBeDefined();
      expect(responseBody.updatedAt).toBeDefined();

      const user = await userRepository.findById(responseBody.id);
      expect(user).toBeDefined();
      expect(user?.email).toBe(registerRequest.email);
      expect(user?.type).toBe(UserType.STUDENT);
      expect(user?.createdAt).toBeDefined();
      expect(user?.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid input', async () => {
      // Given
      const invalidRequest = new RegisterRequest('invalid', 'short');

      // When
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidRequest);

      // Then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toContain(
        'Email invalid is not in a valid format',
      );
    });

    it('should return 409 for existing user', async () => {
      // Given
      await userRepository.create({
        email: 'test@example.com',
        password: 'hashedPassword',
        type: UserType.STUDENT,
      });
      const registerRequest = new RegisterRequest(
        'test@example.com',
        'password123',
      );

      // When
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerRequest);

      // Then
      expect(response.status).toBe(HttpStatus.CONFLICT);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('login', () => {
    it('should login an existing user', async () => {
      // Given
      await userRepository.create({
        email: 'test@example.com',
        password:
          '$2b$10$uKniZFGl/gr6.SWpifzq1ebJLN79UjKw0UcQjv.0oe6jyedaxTNqK',
        type: UserType.STUDENT,
      });
      const loginRequest = new LoginRequest('test@example.com', 'password123');

      // When
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginRequest);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      const responseBody = response.body as LoginResponse;
      expect(responseBody).toHaveProperty('accessToken');
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookiesArr = Array.isArray(cookies) ? cookies : [cookies];
      const hasRefreshTokenCookie = cookiesArr.some((cookie: string) =>
        cookie.startsWith('refreshToken='),
      );
      expect(hasRefreshTokenCookie).toBe(true);
    });

    it('should return 404 for non-existing user', async () => {
      // Given
      const loginRequest = new LoginRequest('test@example.com', 'password123');

      // When
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginRequest);

      // Then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'User with email test@example.com not found',
      );
    });
  });

  describe('logout', () => {
    it('should logout an existing user', async () => {
      // Given
      const accessToken = generateAccessToken(UserType.STUDENT);
      const user = await userRepository.create({
        email: 'test@ritchie-invest.com',
        password: 'hashedPassword',
        type: UserType.STUDENT,
      });
      const refreshToken = await refreshTokenRepository.create({
        userId: user.id,
        token: 'validRefreshToken',
      });

      // When
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', [`refreshToken=${refreshToken.token}`]);

      // Then
      expect(response.status).toBe(HttpStatus.CREATED);
      const token = await refreshTokenRepository.findByToken(
        refreshToken.token,
      );
      if (token) {
        expect(token.expiresAt?.getTime()).toBeLessThan(new Date().getTime());
      } else {
        expect(token).toBeFalsy();
      }
    });
  });

  describe('refresh', () => {
    it('should refresh the access token if refreshToken cookie is valid', async () => {
      // Given
      const email = 'test-refresh@example.com';
      const password = 'password123';
      const registerRequest = new RegisterRequest(email, password);
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerRequest);
      expect(registerResponse.status).toBe(HttpStatus.CREATED);

      const loginRequest = new LoginRequest(email, password);
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginRequest);
      expect(loginResponse.status).toBe(HttpStatus.CREATED);
      const cookiesRaw = loginResponse.headers['set-cookie'];
      expect(cookiesRaw).toBeDefined();
      const cookiesArr: string[] = Array.isArray(cookiesRaw)
        ? cookiesRaw
        : [cookiesRaw as string];

      const refreshCookieFull = cookiesArr.find(
        (cookie) =>
          typeof cookie === 'string' && cookie.startsWith('refreshToken='),
      );
      expect(refreshCookieFull).toBeDefined();
      const refreshCookie = refreshCookieFull
        ? refreshCookieFull.split(';')[0]
        : undefined;
      expect(typeof refreshCookie).toBe('string');
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).not.toEqual('');

      console.log('Test is sending refresh cookie:', refreshCookie);

      // When
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshCookie as string);

      // Then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('accessToken');
      const newCookiesRaw = response.headers['set-cookie'];
      expect(newCookiesRaw).toBeDefined();
      const newCookiesArr: string[] = Array.isArray(newCookiesRaw)
        ? newCookiesRaw
        : [newCookiesRaw as string];
      const hasRefreshTokenCookie = newCookiesArr.some((cookie: string) =>
        cookie.startsWith('refreshToken='),
      );
      expect(hasRefreshTokenCookie).toBe(true);
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
