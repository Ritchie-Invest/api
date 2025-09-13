import { ApiProperty } from '@nestjs/swagger';

export class CompleteLessonResponse {
  @ApiProperty({
    description: 'Number of game modules completed in the lesson',
    example: 3,
  })
  completedGameModules: number;

  @ApiProperty({
    description: 'Total number of game modules in the lesson',
    example: 5,
  })
  totalGameModules: number;

  @ApiProperty({
    description: 'Indicates if the lesson is completed',
    example: true,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Experience points won from completing the lesson',
    example: 10,
  })
  xpWon: number;

  @ApiProperty({
    description: 'Newly awarded badges for this completion',
    example: [{ type: 'LEARN_PERFECT_QUIZ' }],
    isArray: true,
  })
  newlyAwardedBadges: { type: string }[];

  constructor(
    completedGameModules: number,
    totalGameModules: number,
    isCompleted: boolean = false,
    xpWon: number = 0,
    newlyAwardedBadges: { type: string }[] = [],
  ) {
    this.completedGameModules = completedGameModules;
    this.totalGameModules = totalGameModules;
    this.isCompleted = isCompleted;
    this.xpWon = xpWon;
    this.newlyAwardedBadges = newlyAwardedBadges;
  }
}
