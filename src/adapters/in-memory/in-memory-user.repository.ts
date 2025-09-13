import { UserRepository } from '../../core/domain/repository/user.repository';
import { User } from '../../core/domain/model/User';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private lives: Map<string, Date[]> = new Map(); // userId -> array of lost life dates

  create(
    data: Pick<
      User,
      'id' | 'email' | 'password' | 'type' | 'totalXp' | 'isInvestmentUnlocked'
    >,
  ): User {
    const user = new User(
      data.id,
      data.email,
      data.password,
      data.type,
      data.totalXp ?? 0,
      data.isInvestmentUnlocked ?? false,
      new Date(),
      new Date(),
    );
    this.users.set(user.id, user);
    return user;
  }

  findById(id: string): User | null {
    return this.users.get(id) || null;
  }

  findByEmail(email: string): User | null {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  update(id: string, user: User): User | null {
    if (!this.users.has(id)) {
      return null;
    }
    this.users.set(id, user);
    return user;
  }

  incrementXp(userId: string, amount: number): User | null {
    const user = this.users.get(userId);
    if (!user) {
      return null;
    }
    user.totalXp = (user.totalXp ?? 0) + amount;
    this.users.set(userId, user);
    return user;
  }

  remove(id: string): void {
    this.users.delete(id);
  }

  removeAll(): void {
    this.users.clear();
  }

  async getLastLostLife(userId: string): Promise<Date | null> {
    const userLives = this.lives.get(userId);
    if (!userLives || userLives.length === 0) {
      return null;
    }
    return userLives[userLives.length - 1];
  }

  async addLostLife(userId: string): Promise<void> {
    const userLives = this.lives.get(userId) || [];
    userLives.push(new Date());
    this.lives.set(userId, userLives);
  }
}
