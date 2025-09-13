import { DailyBarRepository } from '../../core/domain/repository/daily-bar.repository';
import { DailyBar } from '../../core/domain/model/DailyBar';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryDailyBarRepository implements DailyBarRepository {
  private dailyBars: Map<string, DailyBar> = new Map();

  create(data: Partial<DailyBar>): DailyBar {
    const dailyBar = new DailyBar({
      id: data.id || `dailybar-${Date.now()}`,
      tickerId: data.tickerId!,
      timestamp: data.timestamp!,
      open: data.open!,
      high: data.high!,
      low: data.low!,
      close: data.close!,
      volume: data.volume!,
    });
    this.dailyBars.set(dailyBar.id, dailyBar);
    return dailyBar;
  }

  findById(id: string): DailyBar | null {
    return this.dailyBars.get(id) || null;
  }

  findByTickerIdAndDate(tickerId: string, date: Date): DailyBar | null {
    for (const dailyBar of this.dailyBars.values()) {
      if (
        dailyBar.tickerId === tickerId &&
        dailyBar.timestamp.getTime() === date.getTime()
      ) {
        return dailyBar;
      }
    }
    return null;
  }

  findAll(filter?: Partial<DailyBar>): DailyBar[] {
    let result = Array.from(this.dailyBars.values());
    if (filter?.tickerId) {
      result = result.filter((db) => db.tickerId === filter.tickerId);
    }
    return result;
  }

  update(id: string, data: Partial<DailyBar>): DailyBar | null {
    const existing = this.dailyBars.get(id);
    if (!existing) {
      return null;
    }
    const updated = new DailyBar({
      id: existing.id,
      tickerId: existing.tickerId,
      timestamp: existing.timestamp,
      open: data.open ?? existing.open,
      high: data.high ?? existing.high,
      low: data.low ?? existing.low,
      close: data.close ?? existing.close,
      volume: data.volume ?? existing.volume,
    });
    this.dailyBars.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.dailyBars.delete(id);
  }

  removeAll(): void {
    this.dailyBars.clear();
  }

  findByTickerIdWithLimit(tickerId: string, limit: number): DailyBar[] {
    return Array.from(this.dailyBars.values())
      .filter((db) => db.tickerId === tickerId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by date descending
      .slice(0, limit);
  }

  findLatestByTickerId(tickerId: string): DailyBar | null {
    const dailyBars = this.findByTickerIdWithLimit(tickerId, 1);
    return dailyBars[0] ?? null;
  }
}
