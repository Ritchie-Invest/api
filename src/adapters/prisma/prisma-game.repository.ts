import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';
import { GameRepository } from '../../core/domain/repository/game.repository';
import { PrismaGameMapper } from './mapper/prisma-game.mapper';
import { Game } from '../../core/domain/model/Game';

@Injectable()
export class PrismaGameRepository implements GameRepository {
  private mapper: PrismaGameMapper = new PrismaGameMapper();

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new PrismaGameMapper();
  }

  async create(game: Game): Promise<Game> {
    const createData = this.mapper.fromDomainForCreate(game);
    const createdEntity = await this.prisma.game.create({ data: createData });
    return this.mapper.toDomain(createdEntity);
  }

  async findById(id: string): Promise<Game | null> {
    const entity = await this.prisma.game.findUnique({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findByLesson(lessonId: string): Promise<Game[]> {
    const entities = await this.prisma.game.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async update(id: string, game: Game): Promise<Game | null> {
    const updateData = this.mapper.fromDomainForUpdate(game);
    const updatedEntity = await this.prisma.game.update({
      where: { id },
      data: updateData,
    });
    if (!updatedEntity) {
      return null;
    }
    return this.mapper.toDomain(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.game.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.game.deleteMany();
  }

  async findAll(): Promise<Game[]> {
    const entities = await this.prisma.game.findMany({
      orderBy: [
        { lessonId: 'asc' },
        { order: 'asc' }
      ]
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }
}
