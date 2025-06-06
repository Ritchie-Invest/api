import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { CreateUserUseCase } from './core/usecases/create-user.use-case';
import { JwtServiceAdapter } from './adapters/jwt/jwt.service';
import { LoginUseCase } from './core/usecases/login.use-case';
import { PrismaService } from './adapters/prisma/prisma.service';
import { PrismaUserRepository } from './adapters/prisma/prisma-user.repository';
import { TokenService } from './core/domain/service/token.service';
import { UserController } from './adapters/api/controller/auth.controller';
import { UserRepository } from './core/domain/repository/user.repository';
import { UpdateUserTypeUseCase } from './core/usecases/update-user-type.use-case';
import { CreateChapterUseCase } from './core/usecases/create-chapter.use-case';
import { ChapterRepository } from './core/domain/repository/chapter.repository';
import { PrismaChapterRepository } from './adapters/prisma/prisma-chapter.repository';
import { UpdateChapterUseCase } from './core/usecases/update-chapter.use-case';
import { GetChapterByIdUseCase } from './core/usecases/get-chapter-by-id.use-case';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UserController],
  providers: [
    PrismaService,
    JwtService,
    {
      provide: 'TokenService',
      useFactory: (jwtService: JwtService) => new JwtServiceAdapter(jwtService),
      inject: [JwtService],
    },
    {
      provide: UserRepository,
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: ChapterRepository,
      useFactory: (prisma: PrismaService) =>
        new PrismaChapterRepository(prisma),
      inject: [PrismaService],
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
        tokenService: TokenService,
      ) => new LoginUseCase(userRepository, tokenService),
      inject: [UserRepository, 'TokenService'],
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
  ],
})
export class AppModule {}
