import { Injectable } from '@nestjs/common';
import {
  LifeRepository,
  UserLifeData,
} from '../../core/domain/repository/life.repository';
import { Life } from '../../core/domain/model/Life';

@Injectable()
export class InMemoryLifeRepository implements LifeRepository {
  private static readonly MAX_LIVES = 5;
  private static readonly LIFE_REGENERATION_TIME_MS = 60 * 60 * 1000; // 1 hour in milliseconds

  private readonly lives: Map<string, Life> = new Map();
  private readonly livesByUser: Map<string, Date[]> = new Map();

  create(life: Life): Life {
    this.lives.set(life.id, life);
    const userLives = this.livesByUser.get(life.userId) || [];
    userLives.push(life.emissionDate);
    this.livesByUser.set(life.userId, userLives);
    return life;
  }

  findById(id: string): Life | null {
    return this.lives.get(id) || null;
  }

  findAll(): Life[] {
    return Array.from(this.lives.values());
  }

  update(id: string, life: Life): Life | null {
    if (!this.lives.has(id)) {
      return null;
    }
    this.lives.set(id, life);
    return life;
  }

  remove(id: string): void {
    this.lives.delete(id);
  }

  removeAll(): void {
    this.lives.clear();
    this.livesByUser.clear();
  }

  getLastLostLife(userId: string): Promise<Date | null> {
    const userLives = this.livesByUser.get(userId);
    let value: Date | null;
    if (!userLives || userLives.length === 0) {
      value = null;
    } else {
      value = userLives[userLives.length - 1]!;
    }
    return Promise.resolve(value);
  }

  addLostLife(userId: string): Promise<void> {
    const lifeId = crypto.randomUUID();
    const life = new Life(lifeId, userId, new Date());
    this.create(life);
    return Promise.resolve();
  }

  getUserLifeData(userId: string): Promise<UserLifeData> {
    const now = new Date();
    const oneHourAgo = new Date(
      now.getTime() - InMemoryLifeRepository.LIFE_REGENERATION_TIME_MS,
    );

    const userLives = this.livesByUser.get(userId) || [];
    const livesLostInLastHour = userLives.filter(
      (lostDate) => lostDate >= oneHourAgo,
    ).length;

    const currentLives = Math.max(
      0,
      InMemoryLifeRepository.MAX_LIVES - livesLostInLastHour,
    );
    const hasLost = currentLives === 0;

    let nextLifeIn = 0;
    if (currentLives < InMemoryLifeRepository.MAX_LIVES) {
      const livesInWindow = userLives.filter(
        (lostDate) => lostDate >= oneHourAgo,
      );
      if (livesInWindow.length > 0) {
        const oldestLifeLost = Math.min(
          ...livesInWindow.map((d) => d.getTime()),
        );
        const nextLifeTime = new Date(
          oldestLifeLost + InMemoryLifeRepository.LIFE_REGENERATION_TIME_MS,
        );
        const nextLifeInMs = Math.max(
          0,
          nextLifeTime.getTime() - now.getTime(),
        );
        nextLifeIn = Math.ceil(nextLifeInMs / 1000);
      }
    }

    return Promise.resolve({
      life_number: currentLives,
      next_life_in: nextLifeIn,
      has_lost: hasLost,
    });
  }
}
