import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserPortfolioRepository } from '../../core/domain/repository/user-portfolio.repository';
import { UserPortfolio } from '../../core/domain/model/UserPortfolio';
import { PrismaUserPortfolioMapper } from './mapper/prisma-user-portfolio.mapper';
import { Currency } from '@prisma/client';

@Injectable()
export class PrismaUserPortfolioRepository implements UserPortfolioRepository {
  private readonly mapper = new PrismaUserPortfolioMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<UserPortfolio>): Promise<UserPortfolio> {
    const entity = {
      id: data.id,
      userId: data.userId!,
      currency: data.currency!,
    };
    const created = await this.prisma.userPortfolio.create({ data: entity });
    return this.mapper.toDomain(created);
  }

  async findById(id: string): Promise<UserPortfolio | null> {
    const entity = await this.prisma.userPortfolio.findUnique({
      where: { id },
    });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findByUserId(userId: string): Promise<UserPortfolio | null> {
    const entity = await this.prisma.userPortfolio.findFirst({
      where: { userId },
    });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findAll(filter?: Partial<UserPortfolio>): Promise<UserPortfolio[]> {
    const where = filter?.userId ? { userId: filter.userId } : {};
    const entities = await this.prisma.userPortfolio.findMany({ where });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async update(
    id: string,
    data: Partial<UserPortfolio>,
  ): Promise<UserPortfolio | null> {
    const updateData: {
      userId?: string;
      currency?: Currency;
    } = {};
    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.currency !== undefined) updateData.currency = data.currency;

    const updated = await this.prisma.userPortfolio.update({
      where: { id },
      data: updateData,
    });
    return this.mapper.toDomain(updated);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.userPortfolio.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.userPortfolio.deleteMany();
  }
}
