import { ApiProperty } from '@nestjs/swagger';

export class UserBadgeResponse {
  @ApiProperty({ example: 'LEARN_PERFECT_QUIZ' })
  type: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  awardedAt: string;

  constructor(type: string, awardedAt: string) {
    this.type = type;
    this.awardedAt = awardedAt;
  }
}
