import { ProfileRequest } from '../request/profile.request';
import { MarkBadgeSeenRequest } from '../request/mark-badge-seen.request';
import { MarkBadgeSeenCommand } from '../../../core/usecases/mark-badge-seen.use-case';

export class MarkBadgeSeenMapper {
  static toDomain(
    currentUser: ProfileRequest,
    request: MarkBadgeSeenRequest,
  ): MarkBadgeSeenCommand {
    return {
      userId: currentUser.id,
      type: request.type,
    };
  }
}
