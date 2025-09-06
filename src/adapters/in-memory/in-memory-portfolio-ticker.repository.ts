import { PortfolioTickerRepository } from '../../core/domain/repository/portfolio-ticker.repository';
import { PortfolioTicker } from '../../core/domain/model/PortfolioTicker';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryPortfolioTickerRepository
  implements PortfolioTickerRepository
{
  private portfolioTickers: Map<string, PortfolioTicker> = new Map();

  create(data: Partial<PortfolioTicker>): PortfolioTicker {
    const portfolioTicker = new PortfolioTicker({
      id: data.id || `portfolioticker-${Date.now()}`,
      portfolioId: data.portfolioId!,
      tickerId: data.tickerId!,
      value: data.value!,
      shares: data.shares!,
      date: data.date!,
    });
    this.portfolioTickers.set(portfolioTicker.id, portfolioTicker);
    return portfolioTicker;
  }

  findById(id: string): PortfolioTicker | null {
    return this.portfolioTickers.get(id) || null;
  }

  findByPortfolioIdTickerIdAndDate(
    portfolioId: string,
    tickerId: string,
    date: Date,
  ): PortfolioTicker | null {
    for (const portfolioTicker of this.portfolioTickers.values()) {
      if (
        portfolioTicker.portfolioId === portfolioId &&
        portfolioTicker.tickerId === tickerId &&
        portfolioTicker.date.getTime() === date.getTime()
      ) {
        return portfolioTicker;
      }
    }
    return null;
  }

  findAll(filter?: Partial<PortfolioTicker>): PortfolioTicker[] {
    let result = Array.from(this.portfolioTickers.values());
    if (filter?.portfolioId) {
      result = result.filter((pt) => pt.portfolioId === filter.portfolioId);
    }
    if (filter?.tickerId) {
      result = result.filter((pt) => pt.tickerId === filter.tickerId);
    }
    return result;
  }

  update(id: string, data: Partial<PortfolioTicker>): PortfolioTicker | null {
    const existing = this.portfolioTickers.get(id);
    if (!existing) {
      return null;
    }
    const updated = new PortfolioTicker({
      id: existing.id,
      portfolioId: existing.portfolioId,
      tickerId: existing.tickerId,
      value: data.value ?? existing.value,
      shares: data.shares ?? existing.shares,
      date: existing.date,
    });
    this.portfolioTickers.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.portfolioTickers.delete(id);
  }

  removeAll(): void {
    this.portfolioTickers.clear();
  }
}
