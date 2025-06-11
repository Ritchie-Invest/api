import { UpdateUserTypeCommand } from '../../../core/usecases/update-user-type.use-case';
import { ProfileRequest } from '../request/profile.request';
import { UpdateUserTypeRequest } from '../request/update-user-type.request';
import { User } from '../../../core/domain/model/User';
import { UpdateUserTypeResponse } from '../response/update-user-type.response';

export class UpdateUserTypeMapper {
  static fromDomain(model: User): UpdateUserTypeResponse {
    return {
      id: model.id,
      email: model.email,
      type: model.type,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  static toDomain(
    currentUser: ProfileRequest,
    userId: string,
    request: UpdateUserTypeRequest,
  ): UpdateUserTypeCommand {
    return {
      currentUser: {
        id: currentUser.id,
        type: currentUser.type,
      },
      userId: userId,
      type: request.type,
    };
  }
}
