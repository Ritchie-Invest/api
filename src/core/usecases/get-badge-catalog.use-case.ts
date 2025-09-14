import { Injectable } from '@nestjs/common';
import { BADGE_CATALOG } from '../domain/service/badge-catalog';
import { UserBadgeRepository } from '../domain/repository/user-badge.repository';

export type BadgeCatalogItem = {
  type: string;
  name: string;
  description?: string;
  awardedAt?: string;
  hasSeen: boolean;
};

@Injectable()
export class GetBadgeCatalogUseCase {
  constructor(private readonly userBadgeRepository: UserBadgeRepository) {}

  async execute(userId: string): Promise<BadgeCatalogItem[]> {
    const userBadges = await this.userBadgeRepository.findAllByUser(userId);
    const awardedByType = new Map(
      userBadges.map((b) => [b.type, b.awardedAt.toISOString()]),
    );
    const seenByType = new Map(
      userBadges.map((b) => [b.type, Boolean(b.hasSeenAt)]),
    );
    return BADGE_CATALOG.map((def) => ({
      type: def.type,
      name: def.name,
      description: def.description,
      awardedAt: awardedByType.get(def.type),
      hasSeen: seenByType.get(def.type) ?? false,
    }));
  }
}
