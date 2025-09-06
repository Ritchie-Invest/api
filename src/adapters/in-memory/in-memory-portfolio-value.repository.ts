import { PortfolioValueRepository } from '../../core/domain/repository/portfolio-value.repository';
import { PortfolioValue } from '../../core/domain/model/PortfolioValue';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryPortfolioValueRepository implements PortfolioValueRepository {
  private portfolioValues: Map<string, PortfolioValue> = new Map();

  create(data: Partial<PortfolioValue>): PortfolioValue {
    const portfolioValue = new PortfolioValue({
      id: data.id || `portfoliovalue-${Date.now()}`,
      portfolioId: data.portfolioId!,
      cash: data.cash!,
      investments: data.investments!,
      date: data.date!,
    });
    this.portfolioValues.set(portfolioValue.id, portfolioValue);
    return portfolioValue;
  }

  findById(id: string): PortfolioValue | null {
    return this.portfolioValues.get(id) || null;
  }

  findByPortfolioIdAndDate(portfolioId: string, date: Date): PortfolioValue | null {
    for (const portfolioValue of this.portfolioValues.values()) {
      if (portfolioValue.portfolioId === portfolioId && 
          portfolioValue.date.getTime() === date.getTime()) {
        return portfolioValue;
      }
    }
    return null;
  }

  findAll(filter?: Partial<PortfolioValue>): PortfolioValue[] {
    let result = Array.from(this.portfolioValues.values());
    if (filter?.portfolioId) {
      result = result.filter(pv => pv.portfolioId === filter.portfolioId);
    }
    return result;
  }

  update(id: string, data: Partial<PortfolioValue>): PortfolioValue | null {
    const existing = this.portfolioValues.get(id);
    if (!existing) {
      return null;
    }
    const updated = new PortfolioValue({
      id: existing.id,
      portfolioId: existing.portfolioId,
      cash: data.cash ?? existing.cash,
      investments: data.investments ?? existing.investments,
      date: existing.date,
    });
    this.portfolioValues.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.portfolioValues.delete(id);
  }

  removeAll(): void {
    this.portfolioValues.clear();
  }
}