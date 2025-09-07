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
import { Ticker } from '../../../../core/domain/model/Ticker';
import { TickerType } from '../../../../core/domain/type/TickerType';
import { Currency } from '../../../../core/domain/type/Currency';
import { DailyBar } from '../../../../core/domain/model/DailyBar';
import { VariationDirection } from '../../../../core/domain/type/VariationDirection';
import { UserType } from '../../../../core/domain/type/UserType';

describe('TickerControllerIT', () => {
  let app: INestApplication<App>;
  let tokenService: TokenService;
  let tickerRepository: TickerRepository;

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
    tickerRepository = app.get(TickerRepository);
    await tickerRepository.removeAll();
  });

  afterEach(async () => {
    await tickerRepository.removeAll();
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.message).toBe('No token provided');
  });
});
