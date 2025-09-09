import { Module } from '@nestjs/common';
import { PrismaService } from '../adapters/prisma/prisma.service';
import { UserRepository } from '../core/domain/repository/user.repository';
import { PrismaUserRepository } from '../adapters/prisma/prisma-user.repository';
import { CreateSuperadminUseCase } from '../core/usecases/create-superadmin.use-case';

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateSuperadminUseCase,
      useFactory: (userRepository: UserRepository) =>
        new CreateSuperadminUseCase(userRepository),
      inject: [UserRepository],
    },
  ],
  exports: [CreateSuperadminUseCase],
})
export class AppCliModule {}
