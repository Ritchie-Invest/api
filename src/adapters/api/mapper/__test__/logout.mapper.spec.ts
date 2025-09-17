import { LogoutCommand } from '../../../../core/usecases/logout.use-case';
import { ProfileRequest } from '../../request/profile.request';
import { LogoutMapper } from '../logout.mapper';
import { Email } from '../../../../core/domain/value-object/Email';

describe('LogoutMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and refreshToken to LogoutCommand', () => {
      // Given
      const userRequest = { email: 'test@example.com' } as ProfileRequest;
      const mockRefreshToken = 'dummy-refresh-token';

      // When
      const result: LogoutCommand = LogoutMapper.toDomain(
        userRequest,
        mockRefreshToken,
      );

      // Then
      expect(result).toEqual({
        currentUser: {
          email: new Email('test@example.com'),
        },
        refreshToken: mockRefreshToken,
      });
    });
  });
});
