import { ProfileRequest } from '../request/profile.request';
import {
  GetUserProfileCommand,
  GetUserProfileResult,
} from '../../../core/usecases/get-user-profile.use-case';
import { GetMeResponse } from '../response/get-me.response';

export class GetMeMapper {
  static toDomain(currentUser: ProfileRequest): GetUserProfileCommand {
    return { userId: currentUser.id };
  }

  static fromDomain(result: GetUserProfileResult): GetMeResponse {
    return new GetMeResponse(
      result.id,
      result.email,
      result.totalXp,
      result.level,
      result.xpRequiredForNextLevel,
      result.xpForThisLevel,
      result.isInvestmentUnlocked,
      result.levelRequiredToUnlockInvestment,
      result.life_number,
      result.next_life_in,
      result.has_lost,
    );
  }
}
