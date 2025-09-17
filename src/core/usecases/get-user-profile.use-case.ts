import { UseCase } from '../base/use-case';
import { UserRepository } from '../domain/repository/user.repository';
import { UserNotFoundError } from '../domain/error/UserNotFoundError';
import { Email } from '../domain/value-object/Email';
import { LifeService } from './services/life.service';

export type GetUserProfileCommand = {
  userId: string;
};

export type GetUserProfileResult = {
  id: string;
  email: Email;
  totalXp: number;
  level: number;
  xpRequiredForNextLevel: number;
  xpForThisLevel: number;
  isInvestmentUnlocked: boolean;
  levelRequiredToUnlockInvestment: number;
  life: number;
  nextLifeIn: number;
  hasLost: boolean;
};

export class GetUserProfileUseCase
  implements UseCase<GetUserProfileCommand, GetUserProfileResult>
{
  private readonly LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT = process.env
    .LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT
    ? parseInt(process.env.LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT)
    : 5;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly lifeService: LifeService,
  ) {}

  async execute(command: GetUserProfileCommand): Promise<GetUserProfileResult> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }

    const life = await this.lifeService.getUserLifeNumber(command.userId);
    const nextLifeIn = await this.lifeService.getNextLifeIn(command.userId);
    const hasLost = await this.lifeService.isUserOutOfLives(command.userId);

    return {
      id: user.id,
      email: user.email,
      totalXp: user.totalXp ?? 0,
      level: user.level,
      xpRequiredForNextLevel: user.xpRequiredForNextLevel,
      xpForThisLevel: user.xpForThisLevel,
      isInvestmentUnlocked: user.isInvestmentUnlocked,
      levelRequiredToUnlockInvestment: this.LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT,
      life,
      nextLifeIn,
      hasLost,
    };
  }
}
