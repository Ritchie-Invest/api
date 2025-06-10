import { LogoutCommand } from '../../../core/usecases/logout.use-case';
import { ProfileRequest } from '../request/profile.request';

export class LogoutMapper {
  static toDomain(user: ProfileRequest, refreshToken: string): LogoutCommand {
    return {
      currentUser: user,
      refreshToken: refreshToken,
    };
  }
}
