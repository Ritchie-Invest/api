import { DeleteGameMapper } from '../delete-game.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';

describe('DeleteGameMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and gameId to DeleteGameCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const gameId = 'game-1';

      // When
      const command = DeleteGameMapper.toDomain(currentUser, gameId);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        gameId: 'game-1',
      });
    });

    it('should handle STUDENT user type', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'student-1',
        email: 'student@example.com',
        type: UserType.STUDENT,
      };
      const gameId = 'game-2';

      // When
      const command = DeleteGameMapper.toDomain(currentUser, gameId);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'student-1',
          type: UserType.STUDENT,
        },
        gameId: 'game-2',
      });
    });
  });

  describe('fromDomain', () => {
    it('should create DeleteGameResponse with gameId', () => {
      // Given
      const gameId = 'game-1';

      // When
      const response = DeleteGameMapper.fromDomain(gameId);

      // Then
      expect(response.message).toEqual('Jeu supprimé avec succès');
      expect(response.deletedGameId).toEqual('game-1');
      expect(response.deletedAt).toBeInstanceOf(Date);
    });

    it('should create response with current timestamp', () => {
      // Given
      const gameId = 'game-2';
      const beforeTime = new Date();

      // When
      const response = DeleteGameMapper.fromDomain(gameId);
      const afterTime = new Date();

      // Then
      expect(response.deletedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(response.deletedAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });
  });
});
