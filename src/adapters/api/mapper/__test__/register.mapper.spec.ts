import { RegisterMapper } from '../register.mapper';
import { RegisterRequest } from '../../request/register.request';
import { User } from '../../../../core/domain/model/User';
import { UserType } from '../../../../core/domain/type/UserType';
import { Email } from '../../../../core/domain/value-object/Email';
import { CreateUserCommand } from '../../../../core/usecases/create-user.use-case';
import { RegisterResponse } from '../../response/register.response';

describe('RegisterMapper', () => {
  it('should map User to RegisterResponse', () => {
    // Given
    const user: User = new User(
      '123',
      new Email('user@example.com'),
      'hashOfPassword',
      UserType.STUDENT,
      0,
      false,
      new Date('2023-01-02T00:00:00Z'),
      new Date('2023-01-01T00:00:00Z'),
    );

    // When
    const response = RegisterMapper.fromDomain(user);

    // Then
    expect(response).toEqual<RegisterResponse>({
      id: '123',
      email: 'user@example.com',
      type: UserType.STUDENT,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });
  });

  it('should map CreateUserRequest to CreateUserCommand', () => {
    // Given
    const request: RegisterRequest = {
      email: 'user@example.com',
      password: 'securepassword123',
    };

    // When
    const command = RegisterMapper.toDomain(request);

    // Then
    expect(command).toEqual<CreateUserCommand>({
      email: new Email('user@example.com'),
      password: 'securepassword123',
    });
  });
});
