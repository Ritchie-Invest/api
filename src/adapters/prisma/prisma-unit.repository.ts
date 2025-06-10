import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../../core/domain/repository/unit.repository';
import { PrismaUnitMapper } from './mapper/prisma-unit.mapper';
import { Unit } from '../../core/domain/model/Unit';

@Injectable()
export class PrismaUnitRepository implements UnitRepository {
  private mapper: PrismaUnitMapper = new PrismaUnitMapper();

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new PrismaUnitMapper();
  }

  async create(unit: Unit): Promise<Unit> {
    const entity = this.mapper.fromDomain(unit);
    const createdEntity = await this.prisma.unit.create({ data: entity });
    return this.mapper.toDomain(createdEntity);
  }

  async findById(id: string): Promise<Unit | null> {
    const entity = await this.prisma.unit.findUnique({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findByChapter(chapterId: string): Promise<Unit[]> {
    const entities = await this.prisma.unit.findMany({
      where: { chapterId },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async update(id: string, unit: Unit): Promise<Unit | null> {
    const entity = this.mapper.fromDomain(unit);
    const updatedEntity = await this.prisma.unit.update({
      where: { id },
      data: entity,
    });
    if (!updatedEntity) {
      return null;
    }
    return this.mapper.toDomain(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.unit.delete({ where: { id } });
  }

  removeAll(): Promise<void> | void {
    throw new Error('Method not implemented.');
  }

  findAll(): Promise<Unit[]> {
    throw new Error('Method not implemented.');
  }
}
