import { Injectable } from '@nestjs/common';
import { BADGE_CATALOG } from '../domain/service/badge-catalog';
import { UserBadgeRepository } from '../domain/repository/user-badge.repository';

export type BadgeCatalogItem = {
  type: string;
  name: string;
  iconPath: string;
  description?: string;
  awardedAt?: string;
};

@Injectable()
export class GetBadgeCatalogUseCase {
  constructor(private readonly userBadgeRepository: UserBadgeRepository) {}

  async execute(userId: string): Promise<BadgeCatalogItem[]> {
    const userBadges = await this.userBadgeRepository.findAllByUser(userId);
    const awardedByType = new Map(
      userBadges.map((b) => [b.type, b.awardedAt.toISOString()]),
    );
    return BADGE_CATALOG.map((def) => ({
      type: def.type,
      name: def.name,
      iconPath: def.iconPath,
      description: def.description,
      awardedAt: awardedByType.get(def.type),
    }));
  }
}
