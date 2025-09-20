import { LifeRepository } from '../../domain/repository/life.repository';

export class LifeService {
  private static readonly ENABLE_LIFE_LOSS =
    process.env.ENABLE_LIFE_LOSS === 'true' || true;
  private static readonly MAX_LIVES = process.env.MAX_LIVES
    ? parseInt(process.env.MAX_LIVES)
    : 5;
  private static readonly LIFE_REGENERATION_TIME_MS = process.env
    .LIFE_REGENERATION_TIME_MS
    ? parseInt(process.env.LIFE_REGENERATION_TIME_MS)
    : 60 * 60 * 1000;

  constructor(private readonly lifeRepository: LifeRepository) {}

  async loseLife(userId: string): Promise<void> {
    if (!LifeService.ENABLE_LIFE_LOSS) {
      return;
    }
    await this.lifeRepository.loseLife(userId);
  }

  async getUserLifeNumber(userId: string): Promise<number> {
    if (!LifeService.ENABLE_LIFE_LOSS) {
      return LifeService.MAX_LIVES;
    }
    const until = new Date(
      Date.now() -
        LifeService.LIFE_REGENERATION_TIME_MS * LifeService.MAX_LIVES,
    );
    const lostLivesCount = await this.lifeRepository.getUserLivesUntil(
      userId,
      until,
    );
    return Math.max(0, LifeService.MAX_LIVES - lostLivesCount.length);
  }

  async getNextLifeIn(userId: string): Promise<number> {
    if (!LifeService.ENABLE_LIFE_LOSS) {
      return 0;
    }
    const lastLostLife = await this.lifeRepository.getLastLostLife(userId);
    if (!lastLostLife) {
      return 0;
    }
    const nextLifeTime =
      lastLostLife.lostAt.getTime() + LifeService.LIFE_REGENERATION_TIME_MS;
    const timeRemaining = nextLifeTime - Date.now();
    return timeRemaining > 0 ? timeRemaining : 0;
  }

  async isUserOutOfLives(userId: string): Promise<boolean> {
    if (!LifeService.ENABLE_LIFE_LOSS) {
      return false;
    }
    const lifeNumber = await this.getUserLifeNumber(userId);
    return lifeNumber <= 0;
  }
}
