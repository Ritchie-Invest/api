import { LogoutCommand } from '../../../../core/usecases/logout.use-case';
import { ProfileRequest } from '../../request/profile.request';
import { LogoutMapper } from '../logout.mapper';

describe('LogoutMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and refreshToken to LogoutCommand', () => {
      // Given
      const userRequest = {} as ProfileRequest;
      const mockRefreshToken = 'dummy-refresh-token';

      // When
      const result: LogoutCommand = LogoutMapper.toDomain(
        userRequest,
        mockRefreshToken,
      );

      // Then
      expect(result).toEqual({
        currentUser: userRequest,
        refreshToken: mockRefreshToken,
      });
    });
  });
});
