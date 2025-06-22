import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';
import { LessonRepository } from '../../core/domain/repository/lesson.repository';
import { PrismaLessonMapper } from './mapper/prisma-lesson.mapper';
import { Lesson } from '../../core/domain/model/Lesson';

@Injectable()
export class PrismaLessonRepository implements LessonRepository {
  private mapper: PrismaLessonMapper = new PrismaLessonMapper();

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new PrismaLessonMapper();
  }

  async create(lesson: Lesson): Promise<Lesson> {
    const entity = this.mapper.fromDomain(lesson);
    const createdEntity = await this.prisma.lesson.create({ data: entity });
    return this.mapper.toDomain(createdEntity);
  }

  async findById(id: string): Promise<Lesson | null> {
    const entity = await this.prisma.lesson.findUnique({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findByChapter(chapterId: string): Promise<Lesson[]> {
    const entities = await this.prisma.lesson.findMany({
      where: { chapterId },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async update(id: string, lesson: Lesson): Promise<Lesson | null> {
    const entity = this.mapper.fromDomain(lesson);
    const updatedEntity = await this.prisma.lesson.update({
      where: { id },
      data: entity,
    });
    if (!updatedEntity) {
      return null;
    }
    return this.mapper.toDomain(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.lesson.delete({ where: { id } });
  }

  removeAll(): Promise<void> | void {
    throw new Error('Method not implemented.');
  }

  findAll(): Promise<Lesson[]> {
    throw new Error('Method not implemented.');
  }
}
