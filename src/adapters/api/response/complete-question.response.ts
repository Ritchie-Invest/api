import { ApiProperty } from '@nestjs/swagger';

export class CompleteQuestionResponse {
  @ApiProperty({
    description: 'Whether the answer is correct',
    example: true,
  })
  correctAnswer: boolean;

  @ApiProperty({
    description: 'Feedback message for the answer',
    example: 'Correct! Paris is indeed the capital of France.',
  })
  feedback: string;

  constructor(correctAnswer: boolean, feedback: string) {
    this.correctAnswer = correctAnswer;
    this.feedback = feedback;
  }
}
