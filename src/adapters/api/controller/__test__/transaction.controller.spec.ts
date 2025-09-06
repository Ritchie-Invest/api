import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Reflector } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { DomainErrorFilter } from '../../../../config/domain-error.filter';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TokenService } from '../../../../core/domain/service/token.service';
import { UserType } from '../../../../core/domain/type/UserType';
import { TransactionType } from '../../../../core/domain/type/TransactionType';
import { UserPortfolioRepository } from '../../../../core/domain/repository/user-portfolio.repository';
import { UserRepository } from '../../../../core/domain/repository/user.repository';
import { TickerRepository } from '../../../../core/domain/repository/ticker.repository';
import { DailyBarRepository } from '../../../../core/domain/repository/daily-bar.repository';
import { PortfolioValueRepository } from '../../../../core/domain/repository/portfolio-value.repository';
import { PortfolioTickerRepository } from '../../../../core/domain/repository/portfolio-ticker.repository';
import { TransactionRepository } from '../../../../core/domain/repository/transaction.repository';
import { Currency } from '../../../../core/domain/type/Currency';
import { Ticker } from '../../../../core/domain/model/Ticker';
import { TickerType } from '../../../../core/domain/type/TickerType';

describe('TransactionControllerIT', () => {
  let app: INestApplication<App>;
  let tokenService: TokenService;
  let userRepository: UserRepository;
  let userPortfolioRepository: UserPortfolioRepository;
  let tickerRepository: TickerRepository;
  let dailyBarRepository: DailyBarRepository;
  let portfolioValueRepository: PortfolioValueRepository;
  let portfolioTickerRepository: PortfolioTickerRepository;
  let transactionRepository: TransactionRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const reflector = moduleFixture.get(Reflector);

    app.useGlobalFilters(new DomainErrorFilter());
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalGuards(new JwtAuthGuard(app.get('TokenService'), reflector));

    await app.init();
  });

  beforeEach(async () => {
    tokenService = app.get('TokenService');
    userRepository = app.get(UserRepository);
    userPortfolioRepository = app.get('UserPortfolioRepository');
    tickerRepository = app.get(TickerRepository);
    dailyBarRepository = app.get('DailyBarRepository');
    portfolioValueRepository = app.get('PortfolioValueRepository');
    portfolioTickerRepository = app.get('PortfolioTickerRepository');
    transactionRepository = app.get('TransactionRepository');

    await userRepository.removeAll();
    await userPortfolioRepository.removeAll();
    await tickerRepository.removeAll();
    await dailyBarRepository.removeAll();
    await portfolioValueRepository.removeAll();
    await portfolioTickerRepository.removeAll();
    await transactionRepository.removeAll();
  });

  afterEach(async () => {
    await userRepository.removeAll();
    await userPortfolioRepository.removeAll();
    await tickerRepository.removeAll();
    await dailyBarRepository.removeAll();
    await portfolioValueRepository.removeAll();
    await portfolioTickerRepository.removeAll();
    await transactionRepository.removeAll();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /transaction/execute should execute a buy transaction successfully', async () => {
    // Given
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await userRepository.create({
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashedpassword',
      type: UserType.STUDENT,
    });

    await userPortfolioRepository.create({
      id: 'portfolio-1',
      userId: user.id,
      currency: Currency.USD,
    });

    await tickerRepository.create(
      new Ticker({
        id: 'ticker-1',
        name: 'Test ETF',
        symbol: 'TEST',
        type: TickerType.ETF,
        currency: Currency.USD,
      }),
    );

    await dailyBarRepository.create({
      id: 'dailybar-1',
      tickerId: 'ticker-1',
      timestamp: today,
      open: 100,
      high: 105,
      low: 95,
      close: 100,
      volume: 1000,
    });

    await portfolioValueRepository.create({
      id: 'portfoliovalue-1',
      portfolioId: 'portfolio-1',
      cash: 5000,
      investments: 2000,
      date: today,
    });

    await portfolioTickerRepository.create({
      id: 'portfolioticker-1',
      portfolioId: 'portfolio-1',
      tickerId: 'ticker-1',
      value: 500,
      shares: 5,
      date: today,
    });

    const accessToken = tokenService.generateAccessToken({
      id: 'user-1',
      email: 'test@example.com',
      type: UserType.STUDENT,
      portfolioId: 'portfolio-1',
    });

    const requestBody = {
      tickerId: 'ticker-1',
      type: TransactionType.Buy,
      value: 1000,
    };

    // When
    const response = await request(app.getHttpServer())
      .post('/transaction/execute')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestBody);

    // Then
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({
      cash: 4000,
      investments: 3000,
      tickerHoldings: 1500,
    });
  });

  it('POST /transaction/execute should return 400 for insufficient cash', async () => {
    // Given
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await userRepository.create({
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashedpassword',
      type: UserType.STUDENT,
    });

    await userPortfolioRepository.create({
      id: 'portfolio-1',
      userId: user.id,
      currency: Currency.USD,
    });

    await tickerRepository.create(
      new Ticker({
        id: 'ticker-1',
        name: 'Test ETF',
        symbol: 'TEST',
        type: TickerType.ETF,
        currency: Currency.USD,
      }),
    );

    await dailyBarRepository.create({
      tickerId: 'ticker-1',
      timestamp: today,
      open: 100,
      high: 105,
      low: 95,
      close: 100,
      volume: 1000,
    });

    await portfolioValueRepository.create({
      portfolioId: 'portfolio-1',
      cash: 500,
      investments: 2000,
      date: today,
    });

    await portfolioTickerRepository.create({
      portfolioId: 'portfolio-1',
      tickerId: 'ticker-1',
      value: 500,
      shares: 5,
      date: today,
    });

    const accessToken = tokenService.generateAccessToken({
      id: 'user-1',
      email: 'test@example.com',
      type: UserType.STUDENT,
      portfolioId: 'portfolio-1',
    });

    const requestBody = {
      tickerId: 'ticker-1',
      type: TransactionType.Buy,
      value: 1000,
    };

    // When
    const response = await request(app.getHttpServer())
      .post('/transaction/execute')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestBody);

    // Then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return 401 when no token is provided', async () => {
    const requestBody = {
      tickerId: 'ticker-1',
      type: TransactionType.Buy,
      value: 1000,
    };

    const response = await request(app.getHttpServer())
      .post('/transaction/execute')
      .send(requestBody);

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
