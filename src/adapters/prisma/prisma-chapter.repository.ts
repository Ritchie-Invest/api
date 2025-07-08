import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';
import { ChapterRepository } from '../../core/domain/repository/chapter.repository';
import { PrismaChapterMapper } from './mapper/prisma-chapter.mapper';
import { Chapter } from '../../core/domain/model/Chapter';

@Injectable()
export class PrismaChapterRepository implements ChapterRepository {
  private mapper: PrismaChapterMapper = new PrismaChapterMapper();

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
    const entities = await this.prisma.chapter.findMany();
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

  async findAllWithLessonsDetails(userId: string): Promise<any[]> {
    const entities = await this.prisma.chapter.findMany({
      where: {
        isPublished: true,
      },
      include: {
        lessons: {
          where: {
            isPublished: true,
          },
          orderBy: { order: 'asc' },
          include: {
            modules: {
              orderBy: { createdAt: 'asc' },
              include: {
                Progression: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });
    return entities;
  }
}
