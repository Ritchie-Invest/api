import { UserBadge } from '../../../core/domain/model/UserBadge';
import { UserBadgeResponse } from '../response/user-badge.response';

export class GetUserBadgesMapper {
  static fromDomain(badges: UserBadge[]): UserBadgeResponse[] {
    return badges.map(
      (b) => new UserBadgeResponse(b.type, b.awardedAt.toISOString()),
    );
  }
}
