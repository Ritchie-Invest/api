import {
  LoginCommand,
  LoginResult,
} from '../../../core/usecases/login.use-case';
import { LoginResponse } from '../response/login.response';
import { LoginRequest } from '../request/login.request';
import { Email } from '../../../core/domain/value-object/Email';

export class LoginMapper {
  static fromDomain(result: LoginResult): LoginResponse {
    return new LoginResponse(result.accessToken, result.refreshToken);
  }

  static toDomain(request: LoginRequest): LoginCommand {
    return {
      email: new Email(request.email),
      password: request.password,
    };
  }
}
