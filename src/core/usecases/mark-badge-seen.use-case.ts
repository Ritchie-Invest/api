import { Injectable } from '@nestjs/common';
import { UserBadgeRepository } from '../domain/repository/user-badge.repository';
import { BadgeType } from '../domain/type/BadgeType';

export type MarkBadgeSeenCommand = {
  userId: string;
  type: BadgeType;
};

@Injectable()
export class MarkBadgeSeenUseCase {
  constructor(private readonly userBadgeRepository: UserBadgeRepository) {}

  async execute(command: MarkBadgeSeenCommand): Promise<void> {
    const { userId, type } = command;
    await this.userBadgeRepository.markSeen(userId, type);
  }
}
