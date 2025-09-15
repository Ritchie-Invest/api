import { Injectable } from '@nestjs/common';
import { UserBadgeRepository } from '../domain/repository/user-badge.repository';
import { UserBadge } from '../domain/model/UserBadge';

@Injectable()
export class GetUserBadgesUseCase {
  constructor(private readonly userBadgeRepository: UserBadgeRepository) {}

  async execute(userId: string): Promise<UserBadge[]> {
    return this.userBadgeRepository.findAllByUser(userId);
  }
}
