import { GetMeMapper } from '../get-me.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';

describe('GetMeMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest to GetUserProfileCommand', () => {
      // Given
      const profileRequest: ProfileRequest = {
        id: 'user-123',
        email: 'test@example.com',
        type: UserType.STUDENT,
      };

      // When
      const command = GetMeMapper.toDomain(profileRequest);

      // Then
      expect(command).toStrictEqual({ userId: 'user-123' });
    });
  });

  describe('fromDomain', () => {
    it('should map GetUserProfileResult to GetMeResponse', () => {
      // Given
      const domainResult = {
        id: 'user-123',
        email: 'test@example.com',
        totalXp: 42,
        level: 3,
        xpRequiredForNextLevel: 0,
        xpForThisLevel: 0,
        isInvestmentUnlocked: false,
        levelRequiredToUnlockInvestment: 5,
      };

      // When
      const response = GetMeMapper.fromDomain(domainResult);

      // Then
      expect(response).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        totalXp: 42,
        level: 3,
        xpRequiredForNextLevel: 0,
        xpForThisLevel: 0,
        isInvestmentUnlocked: false,
        levelRequiredToUnlockInvestment: 5,
      });
    });
  });
});
