import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionRepository } from '../../core/domain/repository/transaction.repository';
import { Transaction } from '../../core/domain/model/Transaction';
import { PrismaTransactionMapper } from './mapper/prisma-transaction.mapper';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  private readonly mapper = new PrismaTransactionMapper();

  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const entity = {
      id: data.id,
      portfolioId: data.portfolioId!,
      tickerId: data.tickerId!,
      type: data.type!,
      value: data.value!,
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
    const where: any = {};
    if (filter?.portfolioId) where.portfolioId = filter.portfolioId;
    if (filter?.tickerId) where.tickerId = filter.tickerId;

    const entities = await this.prisma.transaction.findMany({ where });
    return entities.map(entity => this.mapper.toDomain(entity));
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    const updateData: any = {};
    if (data.value !== undefined) updateData.value = data.value;

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });
    return this.mapper.toDomain(updated);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.prisma.transaction.deleteMany();
  }
}