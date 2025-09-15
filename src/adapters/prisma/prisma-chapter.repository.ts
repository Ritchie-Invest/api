import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';
import { ChapterRepository } from '../../core/domain/repository/chapter.repository';
import { PrismaChapterMapper } from './mapper/prisma-chapter.mapper';
import { Chapter } from '../../core/domain/model/Chapter';
import { ChapterWithLessons } from '../../core/domain/model/ChapterWithLessons';
import { PrismaChapterWithLessonsMapper } from './mapper/prisma-chapter-with-lessons.mapper';

@Injectable()
export class PrismaChapterRepository implements ChapterRepository {
  private mapper: PrismaChapterMapper = new PrismaChapterMapper();
  private chapterWithLessonsMapper = new PrismaChapterWithLessonsMapper();

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new PrismaChapterMapper();
  }

  async create(chapter: Chapter): Promise<Chapter> {
    const entity = this.mapper.fromDomain(chapter);
    const createdEntity = await this.prisma.chapter.create({ data: entity });
    return this.mapper.toDomain(createdEntity);
  }

  async findById(id: string): Promise<Chapter | null> {
    const entity = await this.prisma.chapter.findUnique({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findAll(): Promise<Chapter[]> {
    const entities = await this.prisma.chapter.findMany({
      orderBy: { order: 'asc' },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async update(id: string, chapter: Chapter): Promise<Chapter | null> {
    const entity = this.mapper.fromDomain(chapter);
    const updatedEntity = await this.prisma.chapter.update({
      where: { id },
      data: entity,
    });
    if (!updatedEntity) {
      return null;
    }
    return this.mapper.toDomain(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.chapter.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.chapter.deleteMany();
  }

  async findAllWithDetails(userId: string): Promise<ChapterWithLessons[]> {
    const chapters = await this.prisma.chapter.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            modules: {
              orderBy: { createdAt: 'asc' },
              select: { id: true },
            },
            lessonCompletion: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
    });

    return chapters.map((chapter) =>
      this.chapterWithLessonsMapper.toDomain(chapter),
    );
  }

  async validateUniqueOrder(
    order: number,
    excludeChapterId?: string,
  ): Promise<void> {
    const existingChapters = await this.findAll();
    const conflictingChapter = existingChapters.find(
      (chapter: Chapter) =>
        chapter.order === order && chapter.id !== excludeChapterId,
    );
    if (conflictingChapter) {
      throw new (
        await import('../../core/domain/error/ChapterOrderConflictError')
      ).ChapterOrderConflictError(order);
    }
  }

  async getNextOrder(): Promise<number> {
    const chapters = await this.findAll();
    if (chapters.length === 0) {
      return 0;
    }
    return Math.max(...chapters.map((c: Chapter) => c.order)) + 1;
  }
}
