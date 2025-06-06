import { ApiProperty } from '@nestjs/swagger';
import { GetChapterByIdResponse } from './get-chapter-by-id.response';

export class GetChaptersResponse {
  @ApiProperty({ type: [GetChapterByIdResponse] })
  chapters: GetChapterByIdResponse[];

  constructor(chapters: GetChapterByIdResponse[]) {
    this.chapters = chapters;
  }
}
