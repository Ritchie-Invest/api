import { UseCase } from '../base/use-case';
import { UserRepository } from '../domain/repository/user.repository';
import { UserNotFoundError } from '../domain/error/UserNotFoundError';

export type GetUserProfileCommand = {
  userId: string;
};

export type GetUserProfileResult = {
  id: string;
  email: string;
  totalXp: number;
  level: number;
  xpRequiredForNextLevel: number;
  xpForThisLevel: number;
  isInvestmentUnlocked: boolean;
  levelRequiredToUnlockInvestment: number;
};

export class GetUserProfileUseCase
  implements UseCase<GetUserProfileCommand, GetUserProfileResult>
{
  private readonly LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT = process.env
    .LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT
    ? parseInt(process.env.LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT)
    : 5;

  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: GetUserProfileCommand): Promise<GetUserProfileResult> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }
    return {
      id: user.id,
      email: user.email,
      totalXp: user.totalXp ?? 0,
      level: user.level,
      xpRequiredForNextLevel: user.xpRequiredForNextLevel,
      xpForThisLevel: user.xpForThisLevel,
      isInvestmentUnlocked: user.isInvestmentUnlocked,
      levelRequiredToUnlockInvestment: this.LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT,
    };
  }
}
