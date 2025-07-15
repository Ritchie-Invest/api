import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CompleteLessonRequest {
  @ApiProperty({
    description: 'ID of the user completing the lesson',
    example: 'user123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID of the lesson being completed',
    example: 'lesson456',
  })
  @IsString()
  lessonId: string;

  constructor(userId: string, lessonId: string) {
    this.userId = userId;
    this.lessonId = lessonId;
  }
}
