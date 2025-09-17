import { Injectable } from '@nestjs/common';
import { LifeRepository } from '../../core/domain/repository/life.repository';
import { PrismaService } from './prisma.service';
import { PrismaLifeMapper } from './mapper/prisma-life.mapper';
import { Life } from '../../core/domain/model/Life';

@Injectable()
export class PrismaLifeRepository implements LifeRepository {
  private mapper: PrismaLifeMapper;

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new PrismaLifeMapper();
  }

  async loseLife(userId: string): Promise<Life> {
    const lifeEntity = await this.prisma.life.create({
      data: {
        userId,
        lostAt: new Date(),
      },
    });
    return this.mapper.toDomain(lifeEntity);
  }

  async getUserLivesUntil(userId: string, until: Date): Promise<Life[]> {
    const lifeEntities = await this.prisma.life.findMany({
      where: {
        userId,
        lostAt: {
          gte: until,
        },
      },
      orderBy: {
        lostAt: 'asc',
      },
    });
    return lifeEntities.map((entity) => this.mapper.toDomain(entity));
  }

  async getLastLostLife(userId: string): Promise<Life | null> {
    const lastLifeEntity = await this.prisma.life.findFirst({
      where: { userId },
      orderBy: { lostAt: 'desc' },
    });
    if (!lastLifeEntity) {
      return null;
    }
    return this.mapper.toDomain(lastLifeEntity);
  }

  async removeAll(): Promise<void> {
    await this.prisma.life.deleteMany();
  }
}
