import { RegisterRequest } from '../request/register.request';
import { CreateUserCommand } from '../../../core/usecases/create-user.use-case';
import { User } from '../../../core/domain/model/User';
import { RegisterResponse } from '../response/register.response';

export class RegisterMapper {
  static fromDomain(model: User): RegisterResponse {
    return new RegisterResponse(
      model.id,
      model.email,
      model.type,
      model.updatedAt,
      model.createdAt,
    );
  }

  static toDomain(request: RegisterRequest): CreateUserCommand {
    return {
      email: request.email,
      password: request.password,
    };
  }
}
