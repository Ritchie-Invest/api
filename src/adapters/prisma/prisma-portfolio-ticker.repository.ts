import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PortfolioTickerRepository } from '../../core/domain/repository/portfolio-ticker.repository';
import { PortfolioTicker } from '../../core/domain/model/PortfolioTicker';
import { PrismaPortfolioTickerMapper } from './mapper/prisma-portfolio-ticker.mapper';

@Injectable()
export class PrismaPortfolioTickerRepository implements PortfolioTickerRepository {
  private readonly mapper = new PrismaPortfolioTickerMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<PortfolioTicker>): Promise<PortfolioTicker> {
    const entity = {
      id: data.id,
      portfolioId: data.portfolioId!,
      tickerId: data.tickerId!,
      value: data.value!,
      shares: data.shares!,
      date: data.date!,
    };
    const created = await this.prisma.portfolioTicker.create({ data: entity });
    return this.mapper.toDomain(created);
  }

  async findById(id: string): Promise<PortfolioTicker | null> {
    const entity = await this.prisma.portfolioTicker.findUnique({ where: { id } });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findByPortfolioIdTickerIdAndDate(portfolioId: string, tickerId: string, date: Date): Promise<PortfolioTicker | null> {
    const entity = await this.prisma.portfolioTicker.findFirst({
      where: {
        portfolioId,
        tickerId,
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
    });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findAll(filter?: Partial<PortfolioTicker>): Promise<PortfolioTicker[]> {
    const where: any = {};
    if (filter?.portfolioId) where.portfolioId = filter.portfolioId;
    if (filter?.tickerId) where.tickerId = filter.tickerId;

    const entities = await this.prisma.portfolioTicker.findMany({ where });
    return entities.map(entity => this.mapper.toDomain(entity));
  }

  async update(id: string, data: Partial<PortfolioTicker>): Promise<PortfolioTicker | null> {
    const updateData: any = {};
    if (data.value !== undefined) updateData.value = data.value;
    if (data.shares !== undefined) updateData.shares = data.shares;

    const updated = await this.prisma.portfolioTicker.update({
      where: { id },
      data: updateData,
    });
    return this.mapper.toDomain(updated);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.portfolioTicker.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.portfolioTicker.deleteMany();
  }
}