import { ProfileRequest } from '../request/profile.request';

export class ProfileMapper {
  static fromDomain(user: ProfileRequest): ProfileRequest {
    return {
      id: user.id,
      email: user.email,
      type: user.type,
    };
  }
}
