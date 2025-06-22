import { RefreshToken as RefreshTokenEntity } from '@prisma/client';
import { PrismaRefreshTokenMapper } from '../prisma-refresh-token.mapper';
import { RefreshToken } from '../../../../core/domain/model/RefreshToken';

describe('PrismaRefreshTokenMapper', () => {
  const mapper = new PrismaRefreshTokenMapper();

  describe('fromDomain', () => {
    it('should map RefreshToken to RefreshTokenEntity', () => {
      // Given
      const refreshToken: RefreshToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'refresh-token-123',
        expiresAt: new Date('2023-10-01T12:00:00Z'),
      };

      // When
      const entity = mapper.fromDomain(refreshToken);

      // Then
      expect(entity).toEqual({
        id: 'token-1',
        userId: 'user-1',
        token: 'refresh-token-123',
        expiresAt: new Date('2023-10-01T12:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map RefreshTokenEntity to RefreshToken', () => {
      // Given
      const entity: RefreshTokenEntity = {
        id: 'token-1',
        userId: 'user-1',
        token: 'refresh-token-123',
        expiresAt: new Date('2023-10-01T12:00:00Z'),
      };

      // When
      const refreshToken = mapper.toDomain(entity);

      // Then
      expect(refreshToken).toEqual({
        id: 'token-1',
        userId: 'user-1',
        token: 'refresh-token-123',
        expiresAt: new Date('2023-10-01T12:00:00Z'),
      });
    });
  });
});
