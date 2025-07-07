import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteQuestionRequest {
  @ApiProperty({
    description: 'The ID of the selected choice',
    example: 'choice-1',
  })
  @IsNotEmpty()
  @IsString()
  selectedChoiceId: string;

  constructor(selectedChoiceId: string) {
    this.selectedChoiceId = selectedChoiceId;
  }
}
