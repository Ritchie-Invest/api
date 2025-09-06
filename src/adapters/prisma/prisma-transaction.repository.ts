import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionRepository } from '../../core/domain/repository/transaction.repository';
import { Transaction } from '../../core/domain/model/Transaction';
import { PrismaTransactionMapper } from './mapper/prisma-transaction.mapper';
import {
  TransactionType as PrismaTransactionType,
  Prisma,
} from '@prisma/client';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  private readonly mapper = new PrismaTransactionMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const entity = {
      portfolioId: data.portfolioId!,
      tickerId: data.tickerId!,
      type: data.type! as PrismaTransactionType,
      amount: data.amount!,
      volume: data.volume!,
      currentTickerPrice: data.currentTickerPrice!,
      ...(data.id && { id: data.id }),
    };

    const created = await this.prisma.transaction.create({ data: entity });
    return this.mapper.toDomain(created);
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.prisma.transaction.findUnique({ where: { id } });
    if (!entity) return null;
    return this.mapper.toDomain(entity);
  }

  async findAll(filter?: Partial<Transaction>): Promise<Transaction[]> {
    const where: {
      portfolioId?: string;
      tickerId?: string;
    } = {};
    if (filter?.portfolioId) where.portfolioId = filter.portfolioId;
    if (filter?.tickerId) where.tickerId = filter.tickerId;

    const entities = await this.prisma.transaction.findMany({ where });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async update(
    id: string,
    data: Partial<Transaction>,
  ): Promise<Transaction | null> {
    const updateData: Prisma.TransactionUncheckedUpdateInput = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.volume !== undefined) updateData.volume = data.volume;
    if (data.currentTickerPrice !== undefined)
      updateData.currentTickerPrice = data.currentTickerPrice;

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });
    return this.mapper.toDomain(updated);
  }

  async findByPortfolioIdAndTickerId(
    portfolioId: string,
    tickerId: string,
  ): Promise<Transaction[]> {
    const entities = await this.prisma.transaction.findMany({
      where: { portfolioId, tickerId },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async remove(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.transaction.deleteMany();
  }
}
