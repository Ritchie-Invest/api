import { TransactionRepository } from '../../core/domain/repository/transaction.repository';
import { Transaction } from '../../core/domain/model/Transaction';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  create(data: Partial<Transaction>): Transaction {
    const transaction = new Transaction({
      id: data.id || `transaction-${Date.now()}`,
      portfolioId: data.portfolioId!,
      tickerId: data.tickerId!,
      type: data.type!,
      value: data.value!,
    });
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  findById(id: string): Transaction | null {
    return this.transactions.get(id) || null;
  }

  findAll(filter?: Partial<Transaction>): Transaction[] {
    let result = Array.from(this.transactions.values());
    if (filter?.portfolioId) {
      result = result.filter(t => t.portfolioId === filter.portfolioId);
    }
    if (filter?.tickerId) {
      result = result.filter(t => t.tickerId === filter.tickerId);
    }
    return result;
  }

  update(id: string, data: Partial<Transaction>): Transaction | null {
    const existing = this.transactions.get(id);
    if (!existing) {
      return null;
    }
    const updated = new Transaction({
      id: existing.id,
      portfolioId: existing.portfolioId,
      tickerId: existing.tickerId,
      type: existing.type,
      value: data.value ?? existing.value,
    });
    this.transactions.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.transactions.delete(id);
  }

  removeAll(): void {
    this.transactions.clear();
  }
}