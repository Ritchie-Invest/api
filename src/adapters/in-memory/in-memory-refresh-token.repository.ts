import { RefreshToken } from '../../core/domain/model/RefreshToken';
import { RefreshTokenRepository } from '../../core/domain/repository/refresh-token.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private store = new Map<string, RefreshToken>();

  create(data: RefreshToken): RefreshToken {
    const id = data.id || crypto.randomUUID();
    const newToken = new RefreshToken(
      id,
      data.userId,
      data.token,
      data.expiresAt,
    );
    this.store.set(id, newToken);
    return newToken;
  }

  findAll(): RefreshToken[] {
    return Array.from(this.store.values());
  }

  findById(id: string): RefreshToken | null {
    return this.store.get(id) ?? null;
  }

  update(id: string, data: Partial<RefreshToken>): RefreshToken | null {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data } as RefreshToken;
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): RefreshToken {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`RefreshToken with id ${id} not found`);
    }
    this.store.delete(id);
    return existing;
  }

  expireNow(token: string): void {
    for (const [id, rt] of this.store.entries()) {
      if (rt.token === token) {
        this.store.set(id, { ...rt, expiresAt: new Date() });
      }
    }
  }

  findByToken(token: string): RefreshToken | null {
    for (const rt of this.store.values()) {
      if (rt.token === token) {
        return rt;
      }
    }
    return null;
  }

  remove(id: string): void {
    this.store.delete(id);
  }

  removeAll(): void {
    this.store.clear();
  }
}
