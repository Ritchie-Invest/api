import { UserRepository } from '../../domain/repository/user.repository';

export class LevelingService {
  private readonly LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT = process.env
    .LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT
    ? parseInt(process.env.LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT)
    : 5;

  constructor(private readonly userRepository: UserRepository) {}

  async incrementXp(userId: string, amount: number): Promise<void> {
    if (amount > 0) {
      const updatedUser = await this.userRepository.incrementXp(userId, amount);

      if (
        updatedUser &&
        !updatedUser.isInvestmentUnlocked &&
        updatedUser.level >= this.LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT
      ) {
        updatedUser.isInvestmentUnlocked = true;
        await this.userRepository.update(userId, updatedUser);
      }
    }
  }
}
