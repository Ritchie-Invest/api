import { Injectable } from '@nestjs/common';
import { LessonAttemptRepository } from '../../core/domain/repository/lesson-attempt.repository';
import { LessonAttempt } from '../../core/domain/model/LessonAttempt';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaLessonAttemptRepository implements LessonAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(attempt: LessonAttempt): Promise<void> {
    await this.prisma.lessonAttempt.create({
      data: {
        id: attempt.id,
        userId: attempt.userId,
        lessonId: attempt.lessonId,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt ?? null,
      },
    });
  }

  async findLastByUserIdAndLessonId(
    userId: string,
    lessonId: string,
  ): Promise<LessonAttempt | null> {
    const record = await this.prisma.lessonAttempt.findFirst({
      where: { userId, lessonId },
      orderBy: { startedAt: 'desc' },
    });
    if (!record) return null;
    return new LessonAttempt(
      record.id,
      record.userId,
      record.lessonId,
      record.startedAt,
      record.finishedAt ?? undefined,
    );
  }

  async finishAttempt(id: string, finishedAt: Date): Promise<void> {
    await this.prisma.lessonAttempt.update({
      where: { id },
      data: { finishedAt },
    });
  }

  async removeAll(): Promise<void> {
    await this.prisma.lessonAttempt.deleteMany();
  }
}
