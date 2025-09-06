import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TickerRepository } from '../../core/domain/repository/ticker.repository';
import { Ticker } from '../../core/domain/model/Ticker';
import { PrismaTickerMapper } from './mapper/prisma-ticker.mapper';
import { PrismaDailyBarMapper } from './mapper/prisma-daily-bar.mapper';

@Injectable()
export class PrismaTickerRepository implements TickerRepository {
  private readonly mapper = new PrismaTickerMapper();
  private readonly dailyBarMapper = new PrismaDailyBarMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(model: Ticker): Promise<Ticker> {
    const entity = this.mapper.fromDomain(model);
    const created = await this.prisma.ticker.create({ data: entity });

    if (model.history && model.history.length > 0) {
      const bars = model.history.map((h) => {
        const e = this.dailyBarMapper.fromDomain(h);
        return { ...e, tickerId: created.id };
      });
      await this.prisma.dailyBar.createMany({ data: bars });
    }

    const withHistory = await this.prisma.ticker.findUnique({
      where: { id: created.id },
      include: { history: { orderBy: { date: 'asc' } } },
    });
    return this.mapper.toDomain(withHistory!);
  }

  async findAll(): Promise<Ticker[]> {
    const entities = await this.prisma.ticker.findMany({
      include: {
        history: { orderBy: { date: 'asc' } },
      },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findById(id: string): Promise<Ticker | null> {
    const entity = await this.prisma.ticker.findUnique({
      where: { id },
      include: {
        history: { orderBy: { date: 'asc' } },
      },
    });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findBySymbol(symbol: string): Promise<Ticker | null> {
    const entity = await this.prisma.ticker.findUnique({
      where: { symbol },
      include: {
        history: { orderBy: { date: 'asc' } },
      },
    });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async update(id: string, data: Ticker): Promise<Ticker | null> {
    const entity = this.mapper.fromDomain(data);
    const updated = await this.prisma.ticker.update({
      where: { id },
      data: entity,
    });
    return this.mapper.toDomain(updated);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.dailyBar.deleteMany({ where: { tickerId: id } });
    await this.prisma.ticker.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.dailyBar.deleteMany();
    await this.prisma.ticker.deleteMany();
  }
}
