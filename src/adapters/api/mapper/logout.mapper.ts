import { LogoutCommand } from '../../../core/usecases/logout.use-case';
import { ProfileRequest } from '../request/profile.request';
import { Email } from '../../../core/domain/value-object/Email';

export class LogoutMapper {
  static toDomain(user: ProfileRequest, refreshToken: string): LogoutCommand {
    return {
      currentUser: {
        email: new Email(user.email),
      },
      refreshToken: refreshToken,
    };
  }
}
