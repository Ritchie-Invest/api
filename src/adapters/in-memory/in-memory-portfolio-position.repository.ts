import { PortfolioPositionRepository } from '../../core/domain/repository/portfolio-position.repository';
import { PortfolioPosition } from '../../core/domain/model/PortfolioPosition';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryPortfolioPositionRepository
  implements PortfolioPositionRepository
{
  private portfolioPositions: Map<string, PortfolioPosition> = new Map();

  create(data: Partial<PortfolioPosition>): PortfolioPosition {
    const portfolioPosition = new PortfolioPosition({
      id: data.id || `PortfolioPosition-${Date.now()}`,
      portfolioId: data.portfolioId!,
      cash: data.cash!,
      investments: data.investments!,
      date: data.date!,
    });
    this.portfolioPositions.set(portfolioPosition.id, portfolioPosition);
    return portfolioPosition;
  }

  findById(id: string): PortfolioPosition | null {
    return this.portfolioPositions.get(id) || null;
  }

  findByPortfolioIdAndDate(
    portfolioId: string,
    date: Date,
  ): PortfolioPosition | null {
    for (const portfolioPosition of this.portfolioPositions.values()) {
      if (
        portfolioPosition.portfolioId === portfolioId &&
        portfolioPosition.date.getTime() === date.getTime()
      ) {
        return portfolioPosition;
      }
    }
    return null;
  }

  findLatestByPortfolioId(portfolioId: string): PortfolioPosition | null {
    let latest: PortfolioPosition | null = null;
    for (const portfolioPosition of this.portfolioPositions.values()) {
      if (portfolioPosition.portfolioId === portfolioId) {
        if (!latest || portfolioPosition.date > latest.date) {
          latest = portfolioPosition;
        }
      }
    }
    return latest;
  }

  findAllByPortfolioId(
    portfolioId: string,
    limit?: number,
  ): PortfolioPosition[] {
    let result = Array.from(this.portfolioPositions.values())
      .filter((position) => position.portfolioId === portfolioId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Tri par date descendante

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  countByPortfolioId(portfolioId: string): number {
    return Array.from(this.portfolioPositions.values()).filter(
      (position) => position.portfolioId === portfolioId,
    ).length;
  }

  findAll(filter?: Partial<PortfolioPosition>): PortfolioPosition[] {
    let result = Array.from(this.portfolioPositions.values());
    if (filter?.portfolioId) {
      result = result.filter((pv) => pv.portfolioId === filter.portfolioId);
    }
    return result;
  }

  update(
    id: string,
    data: Partial<PortfolioPosition>,
  ): PortfolioPosition | null {
    const existing = this.portfolioPositions.get(id);
    if (!existing) {
      return null;
    }
    const updated = new PortfolioPosition({
      id: existing.id,
      portfolioId: existing.portfolioId,
      cash: data.cash ?? existing.cash,
      investments: data.investments ?? existing.investments,
      date: existing.date,
    });
    this.portfolioPositions.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.portfolioPositions.delete(id);
  }

  removeAll(): void {
    this.portfolioPositions.clear();
  }
}
