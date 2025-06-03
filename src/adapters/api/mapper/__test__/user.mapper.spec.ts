import { UserMapper } from '../user.mapper';
import { CreateUserRequest } from '../../request/create-user.request';

describe('UserMapper', () => {
  it('should map CreateUserRequest to CreateUserCommand', () => {
    // Given
    const request: CreateUserRequest = {
      email: 'user@example.com',
      password: 'securepassword123',
    };

    // When
    const command = UserMapper.toDomain(request);

    // Then
    expect(command).toEqual({
      email: 'user@example.com',
      password: 'securepassword123',
    });
  });
});
