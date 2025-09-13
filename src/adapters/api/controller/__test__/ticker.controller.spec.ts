import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Reflector } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { DomainErrorFilter } from '../../../../config/domain-error.filter';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { TokenService } from '../../../../core/domain/service/token.service';
import { TickerRepository } from '../../../../core/domain/repository/ticker.repository';
import { UserRepository } from '../../../../core/domain/repository/user.repository';
import { UserPortfolioRepository } from '../../../../core/domain/repository/user-portfolio.repository';
import { TransactionRepository } from '../../../../core/domain/repository/transaction.repository';
import { DailyBarRepository } from '../../../../core/domain/repository/daily-bar.repository';
import { Ticker } from '../../../../core/domain/model/Ticker';
import { UserPortfolio } from '../../../../core/domain/model/UserPortfolio';
import { Transaction } from '../../../../core/domain/model/Transaction';
import { TickerType } from '../../../../core/domain/type/TickerType';
import { Currency } from '../../../../core/domain/type/Currency';
import { TransactionType } from '../../../../core/domain/type/TransactionType';
import { DailyBar } from '../../../../core/domain/model/DailyBar';
import { VariationDirection } from '../../../../core/domain/type/VariationDirection';
import { UserType } from '../../../../core/domain/type/UserType';

describe('TickerControllerIT', () => {
  let app: INestApplication<App>;
  let tokenService: TokenService;
  let userRepository: UserRepository;
  let tickerRepository: TickerRepository;
  let userPortfolioRepository: UserPortfolioRepository;
  let transactionRepository: TransactionRepository;

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
    tokenService = app.get('TokenService');
    userRepository = app.get(UserRepository);
    tickerRepository = app.get(TickerRepository);
    userPortfolioRepository = app.get('UserPortfolioRepository');
    transactionRepository = app.get('TransactionRepository');
    await userRepository.removeAll();
    await tickerRepository.removeAll();
    await userPortfolioRepository.removeAll();
    await transactionRepository.removeAll();
  });

  afterEach(async () => {
    await userRepository.removeAll();
    await tickerRepository.removeAll();
    await userPortfolioRepository.removeAll();
    await transactionRepository.removeAll();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tickers should return tickers with price and variations', async () => {
    // Given
    const ticker1 = new Ticker({
      id: 'ticker-1',
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
      history: [
        new DailyBar({
          id: 'bar-1',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-01'),
          open: 470,
          high: 472,
          low: 468,
          close: 471,
          volume: 1000,
        }),
        new DailyBar({
          id: 'bar-2',
          tickerId: 'ticker-1',
          timestamp: new Date('2024-01-02'),
          open: 471,
          high: 475,
          low: 470,
          close: 474,
          volume: 1200,
        }),
      ],
    });

    const ticker2 = new Ticker({
      id: 'ticker-2',
      name: 'Euro Stoxx 50',
      symbol: 'SX5E',
      type: TickerType.ETF,
      currency: Currency.EUR,
      history: [
        new DailyBar({
          id: 'bar-3',
          tickerId: 'ticker-2',
          timestamp: new Date('2024-01-01'),
          open: 4100,
          high: 4120,
          low: 4080,
          close: 4110,
          volume: 500,
        }),
      ],
    });

    const ticker3 = new Ticker({
      id: 'ticker-3',
      name: 'Empty History',
      symbol: 'EMPTY',
      type: TickerType.ETF,
      currency: Currency.USD,
      history: [],
    });

    await tickerRepository.create(ticker1);
    await tickerRepository.create(ticker2);
    await tickerRepository.create(ticker3);

    const accessToken = tokenService.generateAccessToken({
      id: 'user-id',
      email: 'test@ritchie-invest.com',
      type: UserType.STUDENT,
    });

    // When
    const response = await request(app.getHttpServer())
      .get('/tickers')
      .set('Authorization', `Bearer ${accessToken}`);

    // Then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      tickers: [
        {
          id: 'ticker-1',
          name: 'S&P 500 ETF',
          symbol: 'SPY',
          type: 'ETF',
          currency: 'USD',
          price: 474,
          variation: 3,
          variationPercent: 0.64,
          variationDirection: VariationDirection.UP,
        },
        {
          id: 'ticker-2',
          name: 'Euro Stoxx 50',
          symbol: 'SX5E',
          type: 'ETF',
          currency: 'EUR',
          price: 4110,
          variation: 0,
          variationPercent: 0,
          variationDirection: VariationDirection.FLAT,
        },
      ],
    });
  });

  it('should return 401 when no token is provided', async () => {
    const response = await request(app.getHttpServer()).get('/tickers');
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect((response.body as { message: string }).message).toBe(
      'No token provided',
    );
  });

  it('GET /tickers/:tickerId/possessed-value should return possessed value for a ticker', async () => {
    // Given
    const userId = 'user-1';
    const tickerId = 'ticker-1';
    const portfolioId = 'portfolio-1';

    const user = await userRepository.create({
      id: userId,
      email: 'test@example.com',
      password: 'hashedpassword',
      type: UserType.STUDENT,
    });

    const portfolio = new UserPortfolio({
      id: portfolioId,
      userId: user.id,
      currency: Currency.USD,
    });

    const ticker = new Ticker({
      id: tickerId,
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    const buyTransaction1 = new Transaction({
      id: 'transaction-1',
      portfolioId,
      tickerId,
      type: TransactionType.BUY,
      amount: 1000,
      volume: 10,
      currentTickerPrice: 100,
    });

    const buyTransaction2 = new Transaction({
      id: 'transaction-2',
      portfolioId,
      tickerId,
      type: TransactionType.BUY,
      amount: 2000,
      volume: 20,
      currentTickerPrice: 100,
    });

    const sellTransaction = new Transaction({
      id: 'transaction-3',
      portfolioId,
      tickerId,
      type: TransactionType.SELL,
      amount: 500,
      volume: 5,
      currentTickerPrice: 100,
    });

    await userPortfolioRepository.create(portfolio);
    await tickerRepository.create(ticker);
    await transactionRepository.create(buyTransaction1);
    await transactionRepository.create(buyTransaction2);
    await transactionRepository.create(sellTransaction);

    const accessToken = tokenService.generateAccessToken({
      id: userId,
      email: 'test@ritchie-invest.com',
      type: UserType.STUDENT,
    });

    // When
    const response = await request(app.getHttpServer())
      .get(`/tickers/${tickerId}/possessed-value`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      shares: 25,
      amount: 2500,
    });
  });

  it('GET /tickers/:tickerId/possessed-value should return zero when no transactions', async () => {
    // Given
    const userId = 'user-1';
    const tickerId = 'ticker-1';
    const portfolioId = 'portfolio-1';

    const user = await userRepository.create({
      id: userId,
      email: 'test@example.com',
      password: 'hashedpassword',
      type: UserType.STUDENT,
    });

    const portfolio = new UserPortfolio({
      id: portfolioId,
      userId: user.id,
      currency: Currency.USD,
    });

    const ticker = new Ticker({
      id: tickerId,
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    await userPortfolioRepository.create(portfolio);
    await tickerRepository.create(ticker);

    const accessToken = tokenService.generateAccessToken({
      id: userId,
      email: 'test@ritchie-invest.com',
      type: UserType.STUDENT,
    });

    // When
    const response = await request(app.getHttpServer())
      .get(`/tickers/${tickerId}/possessed-value`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      shares: 0,
      amount: 0,
    });
  });

  it('GET /tickers/:tickerId/possessed-value should return 401 when no token provided', async () => {
    const response = await request(app.getHttpServer()).get(
      '/tickers/ticker-1/possessed-value',
    );
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect((response.body as { message: string }).message).toBe(
      'No token provided',
    );
  });

  it('GET /tickers/owned should return user owned ETFs', async () => {
    // Given
    const userId = 'user-1';
    const portfolioId = 'portfolio-1';

    const user = await userRepository.create({
      id: userId,
      email: 'test@example.com',
      password: 'hashedpassword',
      type: UserType.STUDENT,
    });

    const portfolio = new UserPortfolio({
      id: portfolioId,
      userId: user.id,
      currency: Currency.USD,
    });

    const ticker1 = new Ticker({
      id: 'ticker-1',
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    const ticker2 = new Ticker({
      id: 'ticker-2',
      name: 'NASDAQ ETF',
      symbol: 'QQQ',
      type: TickerType.ETF,
      currency: Currency.USD,
    });

    const buyTransaction1 = new Transaction({
      id: 'transaction-1',
      portfolioId,
      tickerId: 'ticker-1',
      type: TransactionType.BUY,
      amount: 1000,
      volume: 10,
      currentTickerPrice: 100,
    });

    const buyTransaction2 = new Transaction({
      id: 'transaction-2',
      portfolioId,
      tickerId: 'ticker-1',
      type: TransactionType.BUY,
      amount: 550,
      volume: 5,
      currentTickerPrice: 110,
    });

    const buyTransaction3 = new Transaction({
      id: 'transaction-3',
      portfolioId,
      tickerId: 'ticker-2',
      type: TransactionType.BUY,
      amount: 4000,
      volume: 20,
      currentTickerPrice: 200,
    });

    await userPortfolioRepository.create(portfolio);
    await tickerRepository.create(ticker1);
    await tickerRepository.create(ticker2);
    await transactionRepository.create(buyTransaction1);
    await transactionRepository.create(buyTransaction2);
    await transactionRepository.create(buyTransaction3);

    const accessToken = tokenService.generateAccessToken({
      id: userId,
      email: 'test@ritchie-invest.com',
      type: UserType.STUDENT,
    });

    // When
    const response = await request(app.getHttpServer())
      .get('/tickers/owned')
      .set('Authorization', `Bearer ${accessToken}`);

    // Then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body as Record<string, unknown>).toEqual({
      tickers: expect.arrayContaining([
        {
          id: 'ticker-1',
          name: 'S&P 500 ETF',
          symbol: 'SPY',
          shares: 15,
          amount: 1550,
        },
        {
          id: 'ticker-2',
          name: 'NASDAQ ETF',
          symbol: 'QQQ',
          shares: 20,
          amount: 4000,
        },
      ]) as unknown[],
    });
  });

  it('GET /tickers/owned should return empty array when user has no ETFs', async () => {
    // Given
    const userId = 'user-1';
    const portfolioId = 'portfolio-1';

    const user = await userRepository.create({
      id: userId,
      email: 'test@example.com',
      password: 'hashedpassword',
      type: UserType.STUDENT,
    });

    const portfolio = new UserPortfolio({
      id: portfolioId,
      userId: user.id,
      currency: Currency.USD,
    });

    await userPortfolioRepository.create(portfolio);

    const accessToken = tokenService.generateAccessToken({
      id: userId,
      email: 'test@ritchie-invest.com',
      type: UserType.STUDENT,
    });

    // When
    const response = await request(app.getHttpServer())
      .get('/tickers/owned')
      .set('Authorization', `Bearer ${accessToken}`);

    // Then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      tickers: [],
    });
  });

  it('GET /tickers/owned should return 401 when no token provided', async () => {
    const response = await request(app.getHttpServer()).get('/tickers/owned');
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('GET /tickers/:tickerId/history should return ticker history', async () => {
    // Given
    const ticker = new Ticker({
      id: 'ticker-1',
      name: 'Test ETF',
      symbol: 'TEST',
      type: TickerType.ETF,
      currency: Currency.USD,
      history: [],
    });

    await tickerRepository.create(ticker);

    const dailyBars = [
      new DailyBar({
        id: 'bar-1',
        tickerId: 'ticker-1',
        timestamp: new Date('2024-01-03'),
        open: 100,
        high: 105,
        low: 99,
        close: 104,
        volume: 1000,
      }),
      new DailyBar({
        id: 'bar-2',
        tickerId: 'ticker-1',
        timestamp: new Date('2024-01-02'),
        open: 95,
        high: 101,
        low: 94,
        close: 100,
        volume: 1200,
      }),
      new DailyBar({
        id: 'bar-3',
        tickerId: 'ticker-1',
        timestamp: new Date('2024-01-01'),
        open: 90,
        high: 96,
        low: 89,
        close: 95,
        volume: 1500,
      }),
    ];

    const dailyBarRepository =
      app.get<DailyBarRepository>('DailyBarRepository');
    for (const dailyBar of dailyBars) {
      await dailyBarRepository.create(dailyBar);
    }

    const accessToken = tokenService.generateAccessToken({
      id: 'user-1',
      email: 'test@ritchie-invest.com',
      type: UserType.STUDENT,
    });

    // When
    const response = await request(app.getHttpServer())
      .get('/tickers/ticker-1/history?limit=2')
      .set('Authorization', `Bearer ${accessToken}`);

    // Then
    expect(response.status).toBe(HttpStatus.OK);
    const responseBody = response.body as {
      history: Array<{ tickerId: string; close: number }>;
    };
    expect(responseBody.history).toHaveLength(2);
    expect(responseBody.history[0]?.tickerId).toBe('ticker-1');
    expect(responseBody.history[0]?.close).toBe(104);
    expect(responseBody.history[1]?.close).toBe(100);
  });

  it('GET /tickers/:tickerId/history should return 401 when no token provided', async () => {
    const response = await request(app.getHttpServer()).get(
      '/tickers/ticker-1/history?limit=30',
    );
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('GET /tickers/:tickerId/history should return 400 when limit is invalid', async () => {
    const accessToken = tokenService.generateAccessToken({
      id: 'user-1',
      email: 'test@ritchie-invest.com',
      type: UserType.STUDENT,
    });

    const response = await request(app.getHttpServer())
      .get('/tickers/ticker-1/history?limit=500')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
