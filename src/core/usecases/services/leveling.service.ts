import { UserRepository } from '../../domain/repository/user.repository';

export class LevelingService {
  constructor(private readonly userRepository: UserRepository) {}

  async incrementXp(userId: string, amount: number): Promise<void> {
    if (amount > 0) {
      await this.userRepository.incrementXp(userId, amount);

      // INFO: User level can now be checked and action can be taken if needed
    }
  }
}
