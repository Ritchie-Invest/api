import { ApiProperty } from '@nestjs/swagger';

export class CompleteLessonResponse {
  @ApiProperty({
    description: 'Score achieved in the lesson',
    example: 0,
  })
  score: number;

  @ApiProperty({
    description: 'Total number of game modules in the lesson',
    example: 5,
  })
  totalGameModules: number;

  constructor(score: number, totalGameModules: number) {
    this.score = score;
    this.totalGameModules = totalGameModules;
  }
}
