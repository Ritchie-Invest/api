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

  @ApiProperty({
    description: 'Current number of lives (0-5)',
  })
  life_number: number;

  @ApiProperty({
    description: 'Time in seconds until next life regeneration',
  })
  next_life_in: number;

  @ApiProperty({
    description: 'Whether the user has lost all lives',
  })
  has_lost: boolean;

  constructor(
    id: string,
    email: string,
    totalXp: number,
    level: number,
    xpRequiredForNextLevel: number,
    xpForThisLevel: number,
    isInvestmentUnlocked: boolean,
    levelRequiredToUnlockInvestment: number,
    life_number: number,
    next_life_in: number,
    has_lost: boolean,
  ) {
    this.id = id;
    this.email = email;
    this.totalXp = totalXp;
    this.level = level;
    this.xpRequiredForNextLevel = xpRequiredForNextLevel;
    this.xpForThisLevel = xpForThisLevel;
    this.isInvestmentUnlocked = isInvestmentUnlocked;
    this.levelRequiredToUnlockInvestment = levelRequiredToUnlockInvestment;
    this.life_number = life_number;
    this.next_life_in = next_life_in;
    this.has_lost = has_lost;
  }
}
