import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { CreateUserUseCase } from './core/usecases/create-user.use-case';
import { JwtServiceAdapter } from './adapters/jwt/jwt.service';
import { LoginUseCase } from './core/usecases/login.use-case';
import { PrismaService } from './adapters/prisma/prisma.service';
import { PrismaUserRepository } from './adapters/prisma/prisma-user.repository';
import { TokenService } from './core/domain/service/token.service';
import { AuthController } from './adapters/api/controller/auth.controller';
import { UserRepository } from './core/domain/repository/user.repository';
import { UpdateUserTypeUseCase } from './core/usecases/update-user-type.use-case';
import { CreateChapterUseCase } from './core/usecases/create-chapter.use-case';
import { ChapterRepository } from './core/domain/repository/chapter.repository';
import { PrismaChapterRepository } from './adapters/prisma/prisma-chapter.repository';
import { UpdateChapterUseCase } from './core/usecases/update-chapter.use-case';
import { GetChapterByIdUseCase } from './core/usecases/get-chapter-by-id.use-case';
import { LessonRepository } from './core/domain/repository/lesson.repository';
import { PrismaLessonRepository } from './adapters/prisma/prisma-lesson.repository';
import { CreateLessonUseCase } from './core/usecases/create-lesson.use-case';
import { UpdateLessonUseCase } from './core/usecases/update-lesson.use-case';
import { GetLessonByIdUseCase } from './core/usecases/get-lesson-by-id.use-case';
import { GetLessonsByChapterIdUseCase } from './core/usecases/get-lessons-by-chapter.use-case';
import { LessonController } from './adapters/api/controller/lesson.controller';
import { RefreshTokenRepository } from './core/domain/repository/refresh-token.repository';
import { ChapterController } from './adapters/api/controller/chapter.controller';
import { UserController } from './adapters/api/controller/user.controller';
import { GetChaptersUseCase } from './core/usecases/get-chapters.use-case';
import { LogoutUseCase } from './core/usecases/logout.use-case';
import { RefreshUseCase } from './core/usecases/refresh.use-case';
import { PrismaRefreshTokenRepository } from './adapters/prisma/prisma-refresh-token.repository';
import { GameModuleRepository } from './core/domain/repository/game-module.repository';
import { PrismaGameModuleRepository } from './adapters/prisma/prisma-game-module.repository';
import { CreateGameModuleUseCase } from './core/usecases/create-game-module.use-case';
import {
  GameModuleStrategyFactory,
  MapGameModuleStrategyFactory,
} from './core/usecases/strategies/game-module-strategy-factory';
import { GameType } from './core/domain/type/GameType';
import { McqModuleStrategy } from './core/usecases/strategies/mcq-module-strategy';
import { CompleteGameModuleUseCase } from './core/usecases/complete-game-module.use-case';
import { GameModuleController } from './adapters/api/controller/game-module.controller';
import {
  CompleteGameModuleStrategyFactory,
  MapCompleteGameModuleStrategyFactory,
} from './core/usecases/strategies/complete-game-module-strategy-factory';
import { McqCompleteGameModuleStrategy } from './core/usecases/strategies/mcq-complete-game-module-strategy';
import { GetUserProgressUseCase } from './core/usecases/get-user-progress-use-case.service';
import { GetGameModuleByIdUseCase } from './core/usecases/get-game-module-by-id.use-case';
import { UpdateGameModuleUseCase } from './core/usecases/update-game-module.use-case';
import { CompleteLessonUseCase } from './core/usecases/complete-lesson.use-case';
import { FillInTheBlankModuleStrategy } from './core/usecases/strategies/fill-in-the-blanks-module-strategy';
import { FillInTheBlankCompleteGameModuleStrategy } from './core/usecases/strategies/fill-in-the-blanks-complete-game-module-strategy';
import { TrueOrFalseModuleStrategy } from './core/usecases/strategies/true-or-false-module-strategy';
import { TrueOrFalseCompleteGameModuleStrategy } from './core/usecases/strategies/true-or-false-complete-game-module-strategy';
import { PrismaLessonAttemptRepository } from './adapters/prisma/prisma-lesson-attempt.repository';
import { LessonAttemptRepository } from './core/domain/repository/lesson-attempt.repository';
import { PrismaModuleAttemptRepository } from './adapters/prisma/prisma-module-attempt.repository';
import { PrismaLessonCompletionRepository } from './adapters/prisma/prisma-lesson-completion.repository';
import { ModuleAttemptRepository } from './core/domain/repository/module-attempt.repository';
import { TickerRepository } from './core/domain/repository/ticker.repository';
import { PrismaTickerRepository } from './adapters/prisma/prisma-ticker.repository';
import { GetTickersWithPriceUseCase } from './core/usecases/get-tickers-with-price.use-case';
import { TickerController } from './adapters/api/controller/ticker.controller';
import { MarketService } from './core/domain/service/market.service';
import { AlphaVantageMarketServiceAdapter } from './adapters/alpha-vantage/alpha-vantage-market-service-adapter.service';
import { UpdateTickersHistoryUseCase } from './core/usecases/update-tickers-history-use.case';
import { TickerHistoryCronService } from './adapters/scheduler/ticker-history.cron';
import { CreateSuperadminUseCase } from './core/usecases/create-superadmin.use-case';
import { LevelingService } from './core/usecases/services/leveling.service';
import { GetUserProfileUseCase } from './core/usecases/get-user-profile.use-case';
import { LoggerMiddleware } from './config/logger.midleware';
import { UserBadgeRepository } from './core/domain/repository/user-badge.repository';
import { GetUserBadgesUseCase } from './core/usecases/get-user-badges.use-case';
import { PrismaUserBadgeRepository } from './adapters/prisma/prisma-user-badge.repository';
import { InMemoryDomainEventBus } from './adapters/events/in-memory-domain-event-bus';
import { AwardBadgesOnLessonCompletedHandler } from './adapters/events/award-badges-on-lesson-completed.handler';
import { DomainEventPublisher } from './core/base/domain-event';
import { GetBadgeCatalogUseCase } from './core/usecases/get-badge-catalog.use-case';
import { CheckAndAwardBadgesUseCase } from './core/usecases/check-and-award-badges.use-case';

@Module({
  imports: [JwtModule.register({}), ScheduleModule.forRoot()],
  controllers: [
    AuthController,
    UserController,
    ChapterController,
    LessonController,
    GameModuleController,
    TickerController,
  ],
  providers: [
    PrismaService,
    JwtService,
    TickerHistoryCronService,
    {
      provide: 'TokenService',
      useFactory: (jwtService: JwtService) => new JwtServiceAdapter(jwtService),
      inject: [JwtService],
    },
    {
      provide: 'MarketService',
      useFactory: () => new AlphaVantageMarketServiceAdapter(),
    },
    {
      provide: 'GameModuleStrategyFactory',
      useFactory: () =>
        new MapGameModuleStrategyFactory([
          {
            type: GameType.MCQ,
            strategy: new McqModuleStrategy(),
          },
          {
            type: GameType.FILL_IN_THE_BLANK,
            strategy: new FillInTheBlankModuleStrategy(),
          },
          {
            type: GameType.TRUE_OR_FALSE,
            strategy: new TrueOrFalseModuleStrategy(),
          },
        ]),
    },
    {
      provide: 'CompleteGameModuleStrategyFactory',
      useFactory: () =>
        new MapCompleteGameModuleStrategyFactory([
          {
            type: GameType.MCQ,
            strategy: new McqCompleteGameModuleStrategy(),
          },
          {
            type: GameType.FILL_IN_THE_BLANK,
            strategy: new FillInTheBlankCompleteGameModuleStrategy(),
          },
          {
            type: GameType.TRUE_OR_FALSE,
            strategy: new TrueOrFalseCompleteGameModuleStrategy(),
          },
        ]),
    },
    {
      provide: UserRepository,
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: RefreshTokenRepository,
      useFactory: (prisma: PrismaService) =>
        new PrismaRefreshTokenRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: ChapterRepository,
      useFactory: (prisma: PrismaService) =>
        new PrismaChapterRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: LessonRepository,
      useFactory: (prisma: PrismaService) => new PrismaLessonRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: GameModuleRepository,
      useFactory: (prisma: PrismaService) =>
        new PrismaGameModuleRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'LessonAttemptRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaLessonAttemptRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'ModuleAttemptRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaModuleAttemptRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'LessonCompletionRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaLessonCompletionRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: UserBadgeRepository,
      useFactory: (prisma: PrismaService) =>
        new PrismaUserBadgeRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: GetUserBadgesUseCase,
      useFactory: (userBadgeRepository: UserBadgeRepository) =>
        new GetUserBadgesUseCase(userBadgeRepository),
      inject: [UserBadgeRepository],
    },
    {
      provide: CheckAndAwardBadgesUseCase,
      useFactory: (
        userBadgeRepository: UserBadgeRepository,
        lessonCompletionRepository: PrismaLessonCompletionRepository,
        lessonRepository: LessonRepository,
      ) =>
        new CheckAndAwardBadgesUseCase(
          userBadgeRepository,
          lessonCompletionRepository,
          lessonRepository,
        ),
      inject: [
        UserBadgeRepository,
        'LessonCompletionRepository',
        LessonRepository,
      ],
    },
    {
      provide: GetBadgeCatalogUseCase,
      useFactory: (userBadgeRepository: UserBadgeRepository) =>
        new GetBadgeCatalogUseCase(userBadgeRepository),
      inject: [UserBadgeRepository],
    },
    {
      provide: TickerRepository,
      useFactory: (prisma: PrismaService) => new PrismaTickerRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: LevelingService,
      useFactory: (userRepository: UserRepository) =>
        new LevelingService(userRepository),
      inject: [UserRepository],
    },
    {
      provide: CreateUserUseCase,
      useFactory: (userRepository: UserRepository) =>
        new CreateUserUseCase(userRepository),
      inject: [UserRepository],
    },
    {
      provide: UpdateUserTypeUseCase,
      useFactory: (userRepository: UserRepository) =>
        new UpdateUserTypeUseCase(userRepository),
      inject: [UserRepository],
    },
    {
      provide: LoginUseCase,
      useFactory: (
        userRepository: UserRepository,
        refreshTokenRepository: RefreshTokenRepository,
        tokenService: TokenService,
      ) =>
        new LoginUseCase(userRepository, refreshTokenRepository, tokenService),
      inject: [UserRepository, RefreshTokenRepository, 'TokenService'],
    },
    {
      provide: LogoutUseCase,
      useFactory: (
        userRepository: UserRepository,
        refreshTokenRepository: RefreshTokenRepository,
      ) => new LogoutUseCase(userRepository, refreshTokenRepository),
      inject: [UserRepository, RefreshTokenRepository],
    },
    {
      provide: RefreshUseCase,
      useFactory: (
        refreshTokenRepository: RefreshTokenRepository,
        tokenService: TokenService,
      ) => new RefreshUseCase(refreshTokenRepository, tokenService),
      inject: [RefreshTokenRepository, 'TokenService'],
    },

    {
      provide: CreateChapterUseCase,
      useFactory: (chapterRepository: ChapterRepository) =>
        new CreateChapterUseCase(chapterRepository),
      inject: [ChapterRepository],
    },
    {
      provide: UpdateChapterUseCase,
      useFactory: (chapterRepository: ChapterRepository) =>
        new UpdateChapterUseCase(chapterRepository),
      inject: [ChapterRepository],
    },
    {
      provide: GetChapterByIdUseCase,
      useFactory: (chapterRepository: ChapterRepository) =>
        new GetChapterByIdUseCase(chapterRepository),
      inject: [ChapterRepository],
    },
    {
      provide: GetChaptersUseCase,
      useFactory: (chapterRepository: ChapterRepository) =>
        new GetChaptersUseCase(chapterRepository),
      inject: [ChapterRepository],
    },
    {
      provide: GetUserProgressUseCase,
      useFactory: (chapterRepository: ChapterRepository) =>
        new GetUserProgressUseCase(chapterRepository),
      inject: [ChapterRepository],
    },
    {
      provide: CreateLessonUseCase,
      useFactory: (lessonRepository: LessonRepository) =>
        new CreateLessonUseCase(lessonRepository),
      inject: [LessonRepository],
    },
    {
      provide: UpdateLessonUseCase,
      useFactory: (lessonRepository: LessonRepository) =>
        new UpdateLessonUseCase(lessonRepository),
      inject: [LessonRepository],
    },
    {
      provide: GetLessonByIdUseCase,
      useFactory: (lessonRepository: LessonRepository) =>
        new GetLessonByIdUseCase(lessonRepository),
      inject: [LessonRepository],
    },
    {
      provide: GetLessonsByChapterIdUseCase,
      useFactory: (lessonRepository: LessonRepository) =>
        new GetLessonsByChapterIdUseCase(lessonRepository),
      inject: [LessonRepository],
    },
    {
      provide: CreateGameModuleUseCase,
      useFactory: (
        lessonRepository: LessonRepository,
        gameModuleRepository: GameModuleRepository,
        gameModuleStrategyFactory: GameModuleStrategyFactory,
      ) =>
        new CreateGameModuleUseCase(
          lessonRepository,
          gameModuleRepository,
          gameModuleStrategyFactory,
        ),
      inject: [
        LessonRepository,
        GameModuleRepository,
        'GameModuleStrategyFactory',
      ],
    },
    {
      provide: CompleteGameModuleUseCase,
      useFactory: (
        gameModuleRepository: GameModuleRepository,
        lessonRepository: LessonRepository,
        strategyFactory: CompleteGameModuleStrategyFactory,
        lessonAttemptRepository: LessonAttemptRepository,
        moduleAttemptRepository: ModuleAttemptRepository,
      ) =>
        new CompleteGameModuleUseCase(
          gameModuleRepository,
          lessonRepository,
          strategyFactory,
          lessonAttemptRepository,
          moduleAttemptRepository,
        ),
      inject: [
        GameModuleRepository,
        LessonRepository,
        'CompleteGameModuleStrategyFactory',
        'LessonAttemptRepository',
        'ModuleAttemptRepository',
      ],
    },
    {
      provide: GetGameModuleByIdUseCase,
      useFactory: (gameModuleRepository: GameModuleRepository) =>
        new GetGameModuleByIdUseCase(gameModuleRepository),
      inject: [GameModuleRepository],
    },
    {
      provide: UpdateGameModuleUseCase,
      useFactory: (
        lessonRepository: LessonRepository,
        gameModuleRepository: GameModuleRepository,
        gameModuleStrategyFactory: GameModuleStrategyFactory,
      ) =>
        new UpdateGameModuleUseCase(
          lessonRepository,
          gameModuleRepository,
          gameModuleStrategyFactory,
        ),
      inject: [
        LessonRepository,
        GameModuleRepository,
        'GameModuleStrategyFactory',
      ],
    },
    {
      provide: CompleteLessonUseCase,
      useFactory: (
        lessonRepository: LessonRepository,
        lessonCompletionRepository: PrismaLessonCompletionRepository,
        lessonAttemptRepository: LessonAttemptRepository,
        moduleAttemptRepository: ModuleAttemptRepository,
        levelingService: LevelingService,
        eventBus: DomainEventPublisher,
      ) =>
        new CompleteLessonUseCase(
          lessonRepository,
          lessonCompletionRepository,
          lessonAttemptRepository,
          moduleAttemptRepository,
          levelingService,
          eventBus,
        ),
      inject: [
        LessonRepository,
        'LessonCompletionRepository',
        'LessonAttemptRepository',
        'ModuleAttemptRepository',
        LevelingService,
        'DomainEventPublisher',
      ],
    },
    {
      provide: 'DomainEventPublisher',
      useFactory: (handler: AwardBadgesOnLessonCompletedHandler) => {
        const bus = new InMemoryDomainEventBus();
        bus.register(handler);
        return bus;
      },
      inject: [AwardBadgesOnLessonCompletedHandler],
    },
    {
      provide: AwardBadgesOnLessonCompletedHandler,
      useFactory: (useCase: CheckAndAwardBadgesUseCase) =>
        new AwardBadgesOnLessonCompletedHandler(useCase),
      inject: [CheckAndAwardBadgesUseCase],
    },
    {
      provide: GetTickersWithPriceUseCase,
      useFactory: (tickerRepository: TickerRepository) =>
        new GetTickersWithPriceUseCase(tickerRepository),
      inject: [TickerRepository],
    },
    {
      provide: UpdateTickersHistoryUseCase,
      useFactory: (
        tickerRepository: TickerRepository,
        marketService: MarketService,
      ) => new UpdateTickersHistoryUseCase(tickerRepository, marketService),
      inject: [TickerRepository, 'MarketService'],
    },
    {
      provide: CreateSuperadminUseCase,
      useFactory: (userRepository: UserRepository) =>
        new CreateSuperadminUseCase(userRepository),
      inject: [UserRepository],
    },
    {
      provide: GetUserProfileUseCase,
      useFactory: (userRepository: UserRepository) =>
        new GetUserProfileUseCase(userRepository),
      inject: [UserRepository],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
