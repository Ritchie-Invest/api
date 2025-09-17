import { GetMeMapper } from '../get-me.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { GetMeResponse } from '../../response/get-me.response';
import { GetUserProfileCommand } from '../../../../core/usecases/get-user-profile.use-case';
import { Email } from '../../../../core/domain/value-object/Email';

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
      expect(command).toEqual<GetUserProfileCommand>({ userId: 'user-123' });
    });
  });

  describe('fromDomain', () => {
    it('should map GetUserProfileResult to GetMeResponse', () => {
      // Given
      const domainResult = {
        id: 'user-123',
        email: new Email('test@example.com'),
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
      expect(response).toEqual<GetMeResponse>({
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
