import { LoginMapper } from '../login.mapper';

describe('LoginMapper', () => {
  describe('fromDomain', () => {
    it('should map LoginResult to LoginResponse', () => {
      // Given
      const result = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      // When
      const response = LoginMapper.fromDomain(result);

      // Then
      expect(response).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('toDomain', () => {
    it('should map LoginRequest to LoginCommand', () => {
      // Given
      const request = {
        email: 'user@example.com',
        password: 'securepassword123',
      };

      // When
      const command = LoginMapper.toDomain(request);

      // Then
      expect(command).toEqual({
        email: 'user@example.com',
        password: 'securepassword123',
      });
    });
  });
});
