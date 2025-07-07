import { Injectable } from '@nestjs/common';
import { ProgressionRepository } from '../../core/domain/repository/progression.repository';
import { Progression } from '../../core/domain/model/Progression';
import { PrismaService } from './prisma.service';
import { PrismaProgressionMapper } from './mapper/prisma-progression.mapper';

@Injectable()
export class PrismaProgressionRepository implements ProgressionRepository {
  private readonly mapper: PrismaProgressionMapper;

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new PrismaProgressionMapper();
  }

  async create(data: Progression): Promise<Progression> {
    const entity = this.mapper.fromDomain(data);
    const createdEntity = await this.prisma.progression.create({ data: entity });
    return this.mapper.toDomain(createdEntity);
  }

  async findAll(): Promise<Progression[]> {
    const entities = await this.prisma.progression.findMany();
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async findById(id: string): Promise<Progression | null> {
    const entity = await this.prisma.progression.findUnique({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findByUserIdAndEntryId(userId: string, entryId: string): Promise<Progression | null> {
    const entity = await this.prisma.progression.findUnique({
      where: {
        userId_entryId: {
          userId,
          entryId,
        },
      },
    });
    if (!entity) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async update(id: string, data: Progression): Promise<Progression | null> {
    const entity = this.mapper.fromDomain(data);
    const updatedEntity = await this.prisma.progression.update({
      where: { id },
      data: entity,
    });
    if (!updatedEntity) {
      return null;
    }
    return this.mapper.toDomain(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.progression.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.progression.deleteMany();
  }
}
