import { Injectable } from '@nestjs/common';
import { ModuleAttemptRepository } from '../../core/domain/repository/module-attempt.repository';
import { ModuleAttempt } from '../../core/domain/model/ModuleAttempt';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaModuleAttemptRepository implements ModuleAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(attempt: ModuleAttempt): Promise<void> {
    await this.prisma.moduleAttempt.create({
      data: {
        id: attempt.id,
        userId: attempt.userId,
        gameModuleId: attempt.gameModuleId,
        lessonAttemptId: attempt.lessonAttemptId,
        isCorrect: attempt.isCorrect,
        answeredAt: attempt.answeredAt,
      },
    });
  }

  async findAllByLessonAttemptId(
    lessonAttemptId: string,
  ): Promise<ModuleAttempt[]> {
    const records = await this.prisma.moduleAttempt.findMany({
      where: { lessonAttemptId },
      orderBy: { answeredAt: 'asc' },
    });
    return records.map(
      (r) =>
        new ModuleAttempt(
          r.id,
          r.userId,
          r.gameModuleId,
          r.lessonAttemptId,
          r.isCorrect,
          r.answeredAt,
        ),
    );
  }

  async findByLessonAttemptIdAndModuleId(
    lessonAttemptId: string,
    moduleId: string,
  ): Promise<ModuleAttempt | null> {
    const record = await this.prisma.moduleAttempt.findFirst({
      where: { lessonAttemptId, gameModuleId: moduleId },
    });
    if (!record) return null;
    return new ModuleAttempt(
      record.id,
      record.userId,
      record.gameModuleId,
      record.lessonAttemptId,
      record.isCorrect,
      record.answeredAt,
    );
  }

  async removeAll(): Promise<void> {
    await this.prisma.moduleAttempt.deleteMany();
  }
}
