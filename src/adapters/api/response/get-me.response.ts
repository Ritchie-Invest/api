import { ApiProperty } from '@nestjs/swagger';

export class GetMeResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ description: 'Total XP earned by the user' })
  totalXp: number;

  @ApiProperty({ description: 'Current user level (starting at 1)' })
  level: number;

  @ApiProperty({ description: 'XP required for the next level' })
  xpRequiredForNextLevel: number;

  @ApiProperty({ description: 'XP already earned for the current level' })
  xpForThisLevel: number;

  @ApiProperty({
    description: 'Flag indicating if the investment simulator is unlocked',
  })
  isInvestmentUnlocked: boolean;

  @ApiProperty({
    description: 'Level required to unlock the investment simulator',
  })
  levelRequiredToUnlockInvestment: number;

  constructor(
    id: string,
    email: string,
    totalXp: number,
    level: number,
    xpRequiredForNextLevel: number,
    xpForThisLevel: number,
    isInvestmentUnlocked: boolean,
    levelRequiredToUnlockInvestment: number,
  ) {
    this.id = id;
    this.email = email;
    this.totalXp = totalXp;
    this.level = level;
    this.xpRequiredForNextLevel = xpRequiredForNextLevel;
    this.xpForThisLevel = xpForThisLevel;
    this.isInvestmentUnlocked = isInvestmentUnlocked;
    this.levelRequiredToUnlockInvestment = levelRequiredToUnlockInvestment;
  }
}
