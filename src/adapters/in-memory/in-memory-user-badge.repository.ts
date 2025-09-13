import { UserBadgeRepository } from '../../core/domain/repository/user-badge.repository';
import { UserBadge } from '../../core/domain/model/UserBadge';
import { BadgeType } from '../../core/domain/type/BadgeType';

export class InMemoryUserBadgeRepository implements UserBadgeRepository {
  private badges: UserBadge[] = [];

  removeAll(): void {
    this.badges = [];
  }

  async findAllByUser(userId: string): Promise<UserBadge[]> {
    await Promise.resolve();
    return this.badges.filter((b) => b.userId === userId);
  }

  async hasBadge(userId: string, type: BadgeType): Promise<boolean> {
    await Promise.resolve();
    return this.badges.some((b) => b.userId === userId && b.type === type);
  }

  async award(userId: string, type: BadgeType): Promise<UserBadge> {
    await Promise.resolve();
    const badge: UserBadge = {
      id: `${userId}-${type}`,
      userId,
      type,
      awardedAt: new Date(),
    };
    this.badges.push(badge);
    return badge;
  }
}
