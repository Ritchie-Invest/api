import { RegisterRequest } from '../request/register.request';
import { CreateUserCommand } from '../../../core/usecases/create-user.use-case';
import { User } from '../../../core/domain/model/User';
import { RegisterResponse } from '../response/register.response';
import { Email } from '../../../core/domain/value-object/Email';

export class RegisterMapper {
  static fromDomain(model: User): RegisterResponse {
    return new RegisterResponse(
      model.id,
      model.email.value(),
      model.type,
      model.updatedAt,
      model.createdAt,
    );
  }

  static toDomain(request: RegisterRequest): CreateUserCommand {
    return {
      email: new Email(request.email),
      password: request.password,
    };
  }
}
