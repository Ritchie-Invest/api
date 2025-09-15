import { DomainModel } from '../../base/domain-model';
import { BadgeType } from '../type/BadgeType';

export class UserBadge extends DomainModel {
  public readonly userId: string;
  public readonly type: BadgeType;
  public readonly awardedAt: Date;
  public readonly hasSeenAt?: Date | null;

  constructor(
    id: string,
    userId: string,
    type: BadgeType,
    awardedAt: Date,
    hasSeenAt?: Date | null,
  ) {
    super(id);
    if (!id) throw new Error('ID is required');
    if (!userId) throw new Error('User ID is required');
    if (!type) throw new Error('Badge type is required');
    if (!awardedAt) throw new Error('Awarded at is required');
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.awardedAt = awardedAt;
    this.hasSeenAt = hasSeenAt ?? null;
  }
}
