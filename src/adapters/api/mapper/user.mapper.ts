import { CreateUserRequest } from '../request/create-user.request';
import { CreateUserCommand } from '../../../core/usecases/create-user.use-case';

export class UserMapper {
  static toDomain(request: CreateUserRequest): CreateUserCommand {
    return { email: request.email, password: request.password };
  }
}
