import { UserPortfolioRepository } from '../../core/domain/repository/user-portfolio.repository';
import { UserPortfolio } from '../../core/domain/model/UserPortfolio';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryUserPortfolioRepository implements UserPortfolioRepository {
  private portfolios: Map<string, UserPortfolio> = new Map();

  create(data: Partial<UserPortfolio>): UserPortfolio {
    const portfolio = new UserPortfolio({
      id: data.id || `portfolio-${Date.now()}`,
      userId: data.userId!,
      currency: data.currency!,
    });
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }

  findById(id: string): UserPortfolio | null {
    return this.portfolios.get(id) || null;
  }

  findByUserId(userId: string): UserPortfolio | null {
    for (const portfolio of this.portfolios.values()) {
      if (portfolio.userId === userId) {
        return portfolio;
      }
    }
    return null;
  }

  findAll(filter?: Partial<UserPortfolio>): UserPortfolio[] {
    let result = Array.from(this.portfolios.values());
    if (filter?.userId) {
      result = result.filter(p => p.userId === filter.userId);
    }
    return result;
  }

  update(id: string, data: Partial<UserPortfolio>): UserPortfolio | null {
    const existing = this.portfolios.get(id);
    if (!existing) {
      return null;
    }
    const updated = new UserPortfolio({
      id: existing.id,
      userId: data.userId ?? existing.userId,
      currency: data.currency ?? existing.currency,
    });
    this.portfolios.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.portfolios.delete(id);
  }

  removeAll(): void {
    this.portfolios.clear();
  }
}