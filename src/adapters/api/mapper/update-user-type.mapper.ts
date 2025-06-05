import { UpdateUserTypeCommand } from '../../../core/usecases/update-user-type.use-case';
import { ProfileRequest } from '../request/profile.request';
import { UpdateUserTypeRequest } from '../request/update-user-type.request';

export class UpdateUserTypeMapper {
  static toDomain(
    currentUser: ProfileRequest,
    userId: string,
    request: UpdateUserTypeRequest,
  ): UpdateUserTypeCommand {
    return {
      currentUser: currentUser,
      userId: userId,
      type: request.type,
    };
  }
}
