import { Injectable } from '@nestjs/common';
import { LessonCompletionRepository } from '../../core/domain/repository/lesson-completion.repository';
import { LessonCompletion } from '../../core/domain/model/LessonCompletion';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaLessonCompletionRepository
  implements LessonCompletionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdAndLessonId(
    userId: string,
    lessonId: string,
  ): Promise<LessonCompletion | null> {
    const record = await this.prisma.lessonCompletion.findFirst({
      where: { userId, lessonId },
    });
    if (!record) return null;
    return new LessonCompletion(
      record.id,
      record.userId,
      record.lessonId,
      record.score,
      record.completedAt,
    );
  }

  async create(lessonCompletion: LessonCompletion): Promise<void> {
    await this.prisma.lessonCompletion.create({
      data: {
        id: lessonCompletion.id,
        userId: lessonCompletion.userId,
        lessonId: lessonCompletion.lessonId,
        score: lessonCompletion.score,
        completedAt: lessonCompletion.completedAt,
      },
    });
  }

  async removeAll(): Promise<void> {
    await this.prisma.lessonCompletion.deleteMany();
  }
}
