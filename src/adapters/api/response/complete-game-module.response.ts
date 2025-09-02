import { ApiProperty } from '@nestjs/swagger';

export class CompleteGameModuleResponse {
  @ApiProperty({
    description: 'Whether the answer is correct',
    example: true,
  })
  isCorrect: boolean;

  @ApiProperty({
    description: 'Feedback message for the answer',
    example: 'Correct! Paris is indeed the capital of France.',
  })
  feedback: string;

  @ApiProperty({
    description: 'Id de la bonne réponse (toujours renvoyé)',
    example: 'choice-1',
  })
  correctChoiceId: string;

  @ApiProperty({
    description: 'ID of the next game module in the lesson, if any',
    example: 'module-789',
    nullable: true,
  })
  nextGameModuleId: string | null;

  @ApiProperty({
    description: 'Index of the current game module in the lesson (0-based)',
    example: 0,
  })
  currentGameModuleIndex: number;

  @ApiProperty({
    description: 'Total number of game modules in the lesson',
    example: 5,
  })
  totalGameModules: number;

  constructor(
    isCorrect: boolean,
    feedback: string,
    correctChoiceId: string,
    nextGameModuleId: string | null,
    currentGameModuleIndex: number,
    totalGameModules: number,
  ) {
    this.isCorrect = isCorrect;
    this.feedback = feedback;
    this.correctChoiceId = correctChoiceId;
    this.nextGameModuleId = nextGameModuleId;
    this.currentGameModuleIndex = currentGameModuleIndex;
    this.totalGameModules = totalGameModules;
  }
}
