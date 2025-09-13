import { Injectable } from '@nestjs/common';
import {
  LifeRepository,
  UserLifeData,
} from '../../core/domain/repository/life.repository';
import { Life } from '../../core/domain/model/Life';
import { PrismaService } from './prisma.service';
import { PrismaLifeMapper } from './mapper/prisma-life.mapper';

@Injectable()
export class PrismaLifeRepository implements LifeRepository {
  private static readonly MAX_LIVES = 5;
  private static readonly LIFE_REGENERATION_TIME_MS = 60 * 60 * 1000; // 1 hour in milliseconds
  private mapper: PrismaLifeMapper;

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new PrismaLifeMapper();
  }

  async create(life: Life): Promise<Life> {
    const entity = this.mapper.fromDomain(life);
    const createdEntity = await this.prisma.life.create({ data: entity });
    return this.mapper.toDomain(createdEntity);
  }

  async findById(id: string): Promise<Life | null> {
    const entity = await this.prisma.life.findUnique({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findAll(): Promise<Life[]> {
    const entities = await this.prisma.life.findMany();
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async update(id: string, life: Life): Promise<Life | null> {
    const entity = this.mapper.fromDomain(life);
    const updatedEntity = await this.prisma.life.update({
      where: { id },
      data: entity,
    });
    if (!updatedEntity) {
      return null;
    }
    return this.mapper.toDomain(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.life.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.life.deleteMany();
  }

  async getLastLostLife(userId: string): Promise<Date | null> {
    const lastLife = await this.prisma.life.findFirst({
      where: { userId },
      orderBy: { emissionDate: 'desc' },
    });
    return lastLife?.emissionDate || null;
  }

  async addLostLife(userId: string): Promise<void> {
    await this.prisma.life.create({
      data: {
        userId,
        emissionDate: new Date(),
      },
    });
  }

  async getUserLifeData(userId: string): Promise<UserLifeData> {
    const now = new Date();
    const oneHourAgo = new Date(
      now.getTime() - PrismaLifeRepository.LIFE_REGENERATION_TIME_MS,
    );

    const livesLostInLastHour = await this.prisma.life.count({
      where: {
        userId,
        emissionDate: {
          gte: oneHourAgo,
        },
      },
    });

    const currentLives = Math.max(
      0,
      PrismaLifeRepository.MAX_LIVES - livesLostInLastHour,
    );
    const hasLost = currentLives === 0;

    let nextLifeIn = 0;
    if (currentLives < PrismaLifeRepository.MAX_LIVES) {
      const oldestLifeLostInWindow = await this.prisma.life.findFirst({
        where: {
          userId,
          emissionDate: {
            gte: oneHourAgo,
          },
        },
        orderBy: { emissionDate: 'asc' },
      });
      if (oldestLifeLostInWindow) {
        const nextLifeTime = new Date(
          oldestLifeLostInWindow.emissionDate.getTime() +
            PrismaLifeRepository.LIFE_REGENERATION_TIME_MS,
        );
        const nextLifeInMs = Math.max(
          0,
          nextLifeTime.getTime() - now.getTime(),
        );
        nextLifeIn = Math.ceil(nextLifeInMs / 1000);
      }
    }

    return {
      life_number: currentLives,
      next_life_in: nextLifeIn,
      has_lost: hasLost,
    };
  }
}
