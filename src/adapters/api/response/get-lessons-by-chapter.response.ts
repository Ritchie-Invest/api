import { ApiProperty } from '@nestjs/swagger';
import { GetLessonByIdResponse } from './get-lesson-by-id.response';

export class GetLessonsByChapterIdResponse {
  @ApiProperty({ type: [GetLessonByIdResponse] })
  lessons: GetLessonByIdResponse[];

  constructor(lessons: GetLessonByIdResponse[]) {
    this.lessons = lessons;
  }
}
