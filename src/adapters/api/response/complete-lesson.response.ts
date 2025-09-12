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

  constructor(
    completedGameModules: number,
    totalGameModules: number,
    isCompleted: boolean = false,
    xpWon: number = 0,
  ) {
    this.completedGameModules = completedGameModules;
    this.totalGameModules = totalGameModules;
    this.isCompleted = isCompleted;
    this.xpWon = xpWon;
  }
}
