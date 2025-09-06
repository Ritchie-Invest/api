import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
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
import { GetUserChaptersUseCase } from './core/usecases/get-user-chapters.use-case';
import { GetGameModuleByIdUseCase } from './core/usecases/get-game-module-by-id.use-case';
import { UpdateGameModuleUseCase } from './core/usecases/update-game-module.use-case';
import { CompleteLessonUseCase } from './core/usecases/complete-lesson.use-case';
import { PrismaLessonAttemptRepository } from './adapters/prisma/prisma-lesson-attempt.repository';
import { LessonAttemptRepository } from './core/domain/repository/lesson-attempt.repository';
import { PrismaModuleAttemptRepository } from './adapters/prisma/prisma-module-attempt.repository';
import { PrismaLessonCompletionRepository } from './adapters/prisma/prisma-lesson-completion.repository';
import { ModuleAttemptRepository } from './core/domain/repository/module-attempt.repository';
import { TickerRepository } from './core/domain/repository/ticker.repository';
import { PrismaTickerRepository } from './adapters/prisma/prisma-ticker.repository';
import { GetTickersWithPriceUseCase } from './core/usecases/get-tickers-with-price.use-case';
import { TickerController } from './adapters/api/controller/ticker.controller';
import { TransactionController } from './adapters/api/controller/transaction.controller';
import { ExecuteTransactionUseCase } from './core/usecases/execute-transaction.use-case';
import { UserPortfolioRepository } from './core/domain/repository/user-portfolio.repository';
import { PrismaUserPortfolioRepository } from './adapters/prisma/prisma-user-portfolio.repository';
import { PortfolioPositionRepository } from './core/domain/repository/portfolio-position.repository';
import { PrismaPortfolioPositionRepository } from './adapters/prisma/prisma-portfolio-position.repository';
import { DailyBarRepository } from './core/domain/repository/daily-bar.repository';
import { PrismaDailyBarRepository } from './adapters/prisma/prisma-daily-bar.repository';
import { TransactionRepository } from './core/domain/repository/transaction.repository';
import { PrismaTransactionRepository } from './adapters/prisma/prisma-transaction.repository';
import { GetPortfolioUseCase } from './core/usecases/get-portfolio.use-case';
import { GetPortfolioPositionsUseCase } from './core/usecases/get-portfolio-positions.use-case';
import { PortfolioController } from './adapters/api/controller/portfolio.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [
    AuthController,
    UserController,
    ChapterController,
    LessonController,
    GameModuleController,
    TickerController,
    TransactionController,
    PortfolioController,
  ],
  providers: [
    PrismaService,
    JwtService,
    {
      provide: 'TokenService',
      useFactory: (jwtService: JwtService) => new JwtServiceAdapter(jwtService),
      inject: [JwtService],
    },
    {
      provide: 'GameModuleStrategyFactory',
      useFactory: () =>
        new MapGameModuleStrategyFactory([
          {
            type: GameType.MCQ,
            strategy: new McqModuleStrategy(),
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
      provide: TickerRepository,
      useFactory: (prisma: PrismaService) => new PrismaTickerRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'UserPortfolioRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaUserPortfolioRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'PortfolioPositionRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaPortfolioPositionRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'DailyBarRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaDailyBarRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'TransactionRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaTransactionRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateUserUseCase,
      useFactory: (
        userRepository: UserRepository,
        userPortfolioRepository: UserPortfolioRepository,
        PortfolioPositionRepository: PortfolioPositionRepository,
      ) =>
        new CreateUserUseCase(
          userRepository,
          userPortfolioRepository,
          PortfolioPositionRepository,
        ),
      inject: [
        UserRepository,
        'UserPortfolioRepository',
        'PortfolioPositionRepository',
      ],
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
        userPortfolioRepository: UserPortfolioRepository,
        tokenService: TokenService,
      ) =>
        new LoginUseCase(
          userRepository,
          refreshTokenRepository,
          userPortfolioRepository,
          tokenService,
        ),
      inject: [
        UserRepository,
        RefreshTokenRepository,
        'UserPortfolioRepository',
        'TokenService',
      ],
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
      provide: GetUserChaptersUseCase,
      useFactory: (chapterRepository: ChapterRepository) =>
        new GetUserChaptersUseCase(chapterRepository),
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
      ) =>
        new CompleteLessonUseCase(
          lessonRepository,
          lessonCompletionRepository,
          lessonAttemptRepository,
          moduleAttemptRepository,
        ),
      inject: [
        LessonRepository,
        'LessonCompletionRepository',
        'LessonAttemptRepository',
        'ModuleAttemptRepository',
      ],
    },
    {
      provide: GetTickersWithPriceUseCase,
      useFactory: (tickerRepository: TickerRepository) =>
        new GetTickersWithPriceUseCase(tickerRepository),
      inject: [TickerRepository],
    },
    {
      provide: ExecuteTransactionUseCase,
      useFactory: (
        userPortfolioRepository: UserPortfolioRepository,
        tickerRepository: TickerRepository,
        dailyBarRepository: DailyBarRepository,
        PortfolioPositionRepository: PortfolioPositionRepository,
        transactionRepository: TransactionRepository,
      ) =>
        new ExecuteTransactionUseCase(
          userPortfolioRepository,
          tickerRepository,
          dailyBarRepository,
          PortfolioPositionRepository,
          transactionRepository,
        ),
      inject: [
        'UserPortfolioRepository',
        TickerRepository,
        'DailyBarRepository',
        'PortfolioPositionRepository',
        'TransactionRepository',
      ],
    },
    {
      provide: GetPortfolioUseCase,
      useFactory: (
        userPortfolioRepository: UserPortfolioRepository,
        PortfolioPositionRepository: PortfolioPositionRepository,
      ) =>
        new GetPortfolioUseCase(
          userPortfolioRepository,
          PortfolioPositionRepository,
        ),
      inject: ['UserPortfolioRepository', 'PortfolioPositionRepository'],
    },
    {
      provide: GetPortfolioPositionsUseCase,
      useFactory: (
        userPortfolioRepository: UserPortfolioRepository,
        portfolioPositionRepository: PortfolioPositionRepository,
      ) =>
        new GetPortfolioPositionsUseCase(
          userPortfolioRepository,
          portfolioPositionRepository,
        ),
      inject: ['UserPortfolioRepository', 'PortfolioPositionRepository'],
    },
  ],
})
export class AppModule {}
