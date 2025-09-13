import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repository/user.repository';
import { PrismaService } from '../../../adapters/prisma/prisma.service';

export type UserLifeData = {
  life_number: number;
  next_life_in: number; // seconds until next life
  has_lost: boolean;
};

@Injectable()
export class LifeService {
  private static readonly MAX_LIVES = 5;
  private static readonly LIFE_REGENERATION_TIME_MS = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getUserLifeData(userId: string): Promise<UserLifeData> {
    const now = new Date();
    // Fenêtre de régénération : une vie revient 1 heure après sa perte.
    const oneHourAgo = new Date(now.getTime() - LifeService.LIFE_REGENERATION_TIME_MS);

    // Compter uniquement les vies perdues dans la dernière heure
    const livesLostInLastHour = await this.prisma.life.count({
      where: {
        userId,
        emissionDate: {
          gte: oneHourAgo,
        },
      },
    });

    const currentLives = Math.max(0, LifeService.MAX_LIVES - livesLostInLastHour);
    const hasLost = currentLives === 0;

    let nextLifeIn = 0;
    if (currentLives < LifeService.MAX_LIVES) {
      // Vie la plus ancienne encore non régénérée (< 1h)
      const oldestLifeLostInWindow = await this.prisma.life.findFirst({
        where: {
          userId,
          emissionDate: {
            gte: oneHourAgo,
          },
        },
        orderBy: { emissionDate: 'asc' },
      });
      if (oldestLifeLostInWindow) {
        const nextLifeTime = new Date(
          oldestLifeLostInWindow.emissionDate.getTime() + LifeService.LIFE_REGENERATION_TIME_MS,
        );
        const nextLifeInMs = Math.max(0, nextLifeTime.getTime() - now.getTime());
        nextLifeIn = Math.ceil(nextLifeInMs / 1000);
      }
    }

    return {
      life_number: currentLives,
      next_life_in: nextLifeIn,
      has_lost: hasLost,
    };
  }

  async addLostLife(userId: string): Promise<void> {
    await this.userRepository.addLostLife(userId);
  }
}