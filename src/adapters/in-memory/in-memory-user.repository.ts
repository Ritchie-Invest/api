import { UserRepository } from '../../core/domain/repository/user.repository';
import { User } from '../../core/domain/model/User';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  create(data: Pick<User, 'id' | 'email' | 'password' | 'type'>): User {
    const user = new User(
      data.id,
      data.email,
      data.password,
      data.type,
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

  remove(id: string): void {
    this.users.delete(id);
  }

  removeAll(): void {
    this.users.clear();
  }
}
