import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PortfolioPositionRepository } from '../../core/domain/repository/portfolio-position.repository';
import { PortfolioPosition } from '../../core/domain/model/PortfolioPosition';
import { PrismaPortfolioPositionMapper } from './mapper/prisma-portfolio-position.mapper';

@Injectable()
export class PrismaPortfolioPositionRepository
  implements PortfolioPositionRepository
{
  private readonly mapper = new PrismaPortfolioPositionMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<PortfolioPosition>): Promise<PortfolioPosition> {
    const entity = {
      id: data.id,
      portfolioId: data.portfolioId!,
      cash: data.cash!,
      investments: data.investments!,
      date: data.date!,
    };
    const created = await this.prisma.portfolioPosition.create({
      data: entity,
    });
    return this.mapper.toDomain(created);
  }

  async findById(id: string): Promise<PortfolioPosition | null> {
    const entity = await this.prisma.portfolioPosition.findUnique({
      where: { id },
    });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findByPortfolioIdAndDate(
    portfolioId: string,
    date: Date,
  ): Promise<PortfolioPosition | null> {
    const entity = await this.prisma.portfolioPosition.findFirst({
      where: {
        portfolioId,
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
    });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findLatestByPortfolioId(
    portfolioId: string,
  ): Promise<PortfolioPosition | null> {
    const entity = await this.prisma.portfolioPosition.findFirst({
      where: { portfolioId },
      orderBy: { date: 'desc' },
    });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findAll(
    filter?: Partial<PortfolioPosition>,
  ): Promise<PortfolioPosition[]> {
    const where: { portfolioId?: string } = {};
    if (filter?.portfolioId) where.portfolioId = filter.portfolioId;
    const entities = await this.prisma.portfolioPosition.findMany({ where });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async findAllByPortfolioId(
    portfolioId: string,
    limit?: number,
    offset?: number,
  ): Promise<PortfolioPosition[]> {
    const entities = await this.prisma.portfolioPosition.findMany({
      where: { portfolioId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async countByPortfolioId(portfolioId: string): Promise<number> {
    return await this.prisma.portfolioPosition.count({
      where: { portfolioId },
    });
  }

  async update(
    id: string,
    data: Partial<PortfolioPosition>,
  ): Promise<PortfolioPosition | null> {
    const updateData: {
      cash?: number;
      investments?: number;
    } = {};
    if (data.cash !== undefined) updateData.cash = data.cash;
    if (data.investments !== undefined)
      updateData.investments = data.investments;

    const updated = await this.prisma.portfolioPosition.update({
      where: { id },
      data: updateData,
    });
    return this.mapper.toDomain(updated);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.portfolioPosition.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.portfolioPosition.deleteMany();
  }
}
