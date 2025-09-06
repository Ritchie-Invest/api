import { Injectable } from '@nestjs/common';
import { TickerRepository } from '../../core/domain/repository/ticker.repository';
import { Ticker } from '../../core/domain/model/Ticker';

@Injectable()
export class InMemoryTickerRepository implements TickerRepository {
  private readonly items = new Map<string, Ticker>();

  create(data: Ticker): Ticker {
    this.items.set(data.id, data);
    return data;
  }

  findAll(): Ticker[] {
    return Array.from(this.items.values());
  }

  findById(id: string): Ticker | null {
    return this.items.get(id) || null;
  }

  findBySymbol(symbol: string): Ticker | null {
    return (
      Array.from(this.items.values()).find((item) => item.symbol === symbol) ||
      null
    );
  }

  update(id: string, data: Ticker): Ticker | null {
    if (!this.items.has(id)) {
      return null;
    }
    this.items.set(id, data);
    return data;
  }

  remove(id: string): void {
    this.items.delete(id);
  }

  removeAll(): void {
    this.items.clear();
  }
}
