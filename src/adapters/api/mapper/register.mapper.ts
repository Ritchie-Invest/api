import { RegisterRequest } from '../request/register.request';
import { CreateUserCommand } from '../../../core/usecases/create-user.use-case';
import { User } from '../../../core/domain/model/User';
import { RegisterResponse } from '../response/register.response';

export class RegisterMapper {
  static fromDomain(model: User): RegisterResponse {
    return {
      id: model.id,
      email: model.email,
      type: model.type,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  static toDomain(request: RegisterRequest): CreateUserCommand {
    return {
      email: request.email,
      password: request.password,
    };
  }
}
