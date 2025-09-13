import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserBadgeRepository } from '../../core/domain/repository/user-badge.repository';
import { UserBadge } from '../../core/domain/model/UserBadge';
import { BadgeType } from '../../core/domain/type/BadgeType';

@Injectable()
export class PrismaUserBadgeRepository implements UserBadgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<UserBadge[]> {
    const rows = await this.prisma.userBadge.findMany({
      where: { userId },
    });
    return rows.map(
      (r: { id: string; userId: string; type: string; awardedAt: Date }) =>
        new UserBadge(r.id, r.userId, r.type as BadgeType, r.awardedAt),
    );
  }

  async hasBadge(userId: string, type: BadgeType): Promise<boolean> {
    const existing = await this.prisma.userBadge.findFirst({
      where: { userId, type },
      select: { id: true },
    });
    return !!existing;
  }

  async award(userId: string, type: BadgeType): Promise<UserBadge> {
    const created = await this.prisma.userBadge.create({
      data: { userId, type },
    });
    return new UserBadge(
      created.id,
      created.userId,
      created.type as BadgeType,
      created.awardedAt,
    );
  }
}
