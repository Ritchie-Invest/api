import { UserBadge } from '../model/UserBadge';
import { BadgeType } from '../type/BadgeType';

export abstract class UserBadgeRepository {
  abstract findAllByUser(userId: string): Promise<UserBadge[]> | UserBadge[];
  abstract hasBadge(
    userId: string,
    type: BadgeType,
  ): Promise<boolean> | boolean;
  abstract award(
    userId: string,
    type: BadgeType,
  ): Promise<UserBadge> | UserBadge;
}
