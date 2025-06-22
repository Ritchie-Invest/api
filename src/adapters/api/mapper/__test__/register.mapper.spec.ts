import { RegisterMapper } from '../register.mapper';
import { RegisterRequest } from '../../request/register.request';
import { User } from '../../../../core/domain/model/User';
import { UserType } from '../../../../core/domain/type/UserType';

describe('RegisterMapper', () => {
  it('should map User to RegisterResponse', () => {
    // Given
    const user: User = {
      id: '123',
      email: 'user@example.com',
      password: 'hashOfPassword',
      type: UserType.STUDENT,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    // When
    const response = RegisterMapper.fromDomain(user);

    // Then
    expect(response).toEqual({
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
    expect(command).toEqual({
      email: 'user@example.com',
      password: 'securepassword123',
    });
  });
});
