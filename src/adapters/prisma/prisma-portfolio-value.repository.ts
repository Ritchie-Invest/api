import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PortfolioValueRepository } from '../../core/domain/repository/portfolio-value.repository';
import { PortfolioValue } from '../../core/domain/model/PortfolioValue';
import { PrismaPortfolioValueMapper } from './mapper/prisma-portfolio-value.mapper';

@Injectable()
export class PrismaPortfolioValueRepository
  implements PortfolioValueRepository
{
  private readonly mapper = new PrismaPortfolioValueMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<PortfolioValue>): Promise<PortfolioValue> {
    const entity = {
      id: data.id,
      portfolioId: data.portfolioId!,
      cash: data.cash!,
      investments: data.investments!,
      date: data.date!,
    };
    const created = await this.prisma.portfolioValue.create({ data: entity });
    return this.mapper.toDomain(created);
  }

  async findById(id: string): Promise<PortfolioValue | null> {
    const entity = await this.prisma.portfolioValue.findUnique({
      where: { id },
    });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findByPortfolioIdAndDate(
    portfolioId: string,
    date: Date,
  ): Promise<PortfolioValue | null> {
    const entity = await this.prisma.portfolioValue.findFirst({
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

  async findAll(filter?: Partial<PortfolioValue>): Promise<PortfolioValue[]> {
    const where = filter?.portfolioId
      ? { portfolioId: filter.portfolioId }
      : {};
    const entities = await this.prisma.portfolioValue.findMany({ where });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async update(
    id: string,
    data: Partial<PortfolioValue>,
  ): Promise<PortfolioValue | null> {
    const updateData: {
      cash?: number;
      investments?: number;
    } = {};
    if (data.cash !== undefined) updateData.cash = data.cash;
    if (data.investments !== undefined)
      updateData.investments = data.investments;

    const updated = await this.prisma.portfolioValue.update({
      where: { id },
      data: updateData,
    });
    return this.mapper.toDomain(updated);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.portfolioValue.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.portfolioValue.deleteMany();
  }
}
