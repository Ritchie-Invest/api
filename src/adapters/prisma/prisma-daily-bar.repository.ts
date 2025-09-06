import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DailyBarRepository } from '../../core/domain/repository/daily-bar.repository';
import { DailyBar } from '../../core/domain/model/DailyBar';
import { PrismaDailyBarMapper } from './mapper/prisma-daily-bar.mapper';

@Injectable()
export class PrismaDailyBarRepository implements DailyBarRepository {
  private readonly mapper = new PrismaDailyBarMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<DailyBar>): Promise<DailyBar> {
    const entity = {
      id: data.id,
      tickerId: data.tickerId!,
      date: data.timestamp!,
      open: data.open!,
      high: data.high!,
      low: data.low!,
      close: data.close!,
      volume: data.volume!,
    };
    const created = await this.prisma.dailyBar.create({ data: entity });
    return this.mapper.toDomain(created);
  }

  async findById(id: string): Promise<DailyBar | null> {
    const entity = await this.prisma.dailyBar.findUnique({ where: { id } });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findByTickerIdAndDate(tickerId: string, date: Date): Promise<DailyBar | null> {
    const entity = await this.prisma.dailyBar.findFirst({
      where: {
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

  async findAll(filter?: Partial<DailyBar>): Promise<DailyBar[]> {
    const where = filter?.tickerId ? { tickerId: filter.tickerId } : {};
    const entities = await this.prisma.dailyBar.findMany({ where });
    return entities.map(entity => this.mapper.toDomain(entity));
  }

  async update(id: string, data: Partial<DailyBar>): Promise<DailyBar | null> {
    const updateData: any = {};
    if (data.open !== undefined) updateData.open = data.open;
    if (data.high !== undefined) updateData.high = data.high;
    if (data.low !== undefined) updateData.low = data.low;
    if (data.close !== undefined) updateData.close = data.close;
    if (data.volume !== undefined) updateData.volume = data.volume;

    const updated = await this.prisma.dailyBar.update({
      where: { id },
      data: updateData,
    });
    return this.mapper.toDomain(updated);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.dailyBar.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.dailyBar.deleteMany();
  }
}