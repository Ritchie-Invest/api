import { Injectable } from '@nestjs/common';
import { LifeRepository } from '../../core/domain/repository/life.repository';
import { Life } from '../../core/domain/model/Life';

@Injectable()
export class InMemoryLifeRepository implements LifeRepository {
  private readonly lives: Map<string, Life> = new Map();

  create(data: Partial<Life>): Life {
    const life = new Life({
      id: data.id || crypto.randomUUID(),
      userId: data.userId!,
      lostAt: data.lostAt || new Date(),
    });
    this.lives.set(life.id, life);
    return life;
  }

  async loseLife(userId: string): Promise<Life> {
    const life = new Life({
      id: crypto.randomUUID(),
      userId,
      lostAt: new Date(),
    });
    this.lives.set(life.id, life);
    return Promise.resolve(life);
  }

  async getUserLivesUntil(userId: string, until: Date): Promise<Life[]> {
    return Promise.resolve(
      Array.from(this.lives.values())
        .filter((life) => life.userId === userId && life.lostAt >= until)
        .sort((a, b) => a.lostAt.getTime() - b.lostAt.getTime()),
    );
  }

  async getLastLostLife(userId: string): Promise<Life | null> {
    return Promise.resolve(
      Array.from(this.lives.values())
        .sort((a, b) => b.lostAt.getTime() - a.lostAt.getTime())
        .find((life) => life.userId === userId) || null,
    );
  }

  removeAll(): void {
    this.lives.clear();
  }
}
