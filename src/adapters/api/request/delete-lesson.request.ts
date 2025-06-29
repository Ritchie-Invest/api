import { ApiProperty } from '@nestjs/swagger';

export class DeleteLessonRequest {
  @ApiProperty({ description: 'ID of the lesson to delete' })
  lessonId: string;

  constructor(lessonId: string) {
    this.lessonId = lessonId;
  }
}
