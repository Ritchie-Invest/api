import { RegisterRequest } from '../request/register.request';
import {
  CreateUserCommand,
  CreateUserResult,
} from '../../../core/usecases/create-user.use-case';
import { RegisterResponse } from '../response/register.response';

export class RegisterMapper {
  static fromDomain(result: CreateUserResult): RegisterResponse {
    return new RegisterResponse(result.accessToken, result.refreshToken);
  }

  static toDomain(request: RegisterRequest): CreateUserCommand {
    return {
      email: request.email,
      password: request.password,
    };
  }
}
