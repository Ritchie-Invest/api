import { RegisterMapper } from '../register.mapper';
import { RegisterRequest } from '../../request/register.request';
import { CreateUserResult } from '../../../../core/usecases/create-user.use-case';

describe('RegisterMapper', () => {
  it('should map CreateUserResult to RegisterResponse', () => {
    // Given
    const result: CreateUserResult = {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    };

    // When
    const response = RegisterMapper.fromDomain(result);

    // Then
    expect(response).toEqual({
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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
