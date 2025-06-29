import { ApiProperty } from '@nestjs/swagger';

export class DeleteChapterRequest {
  @ApiProperty({ description: 'ID of the chapter to delete' })
  chapterId: string;

  constructor(chapterId: string) {
    this.chapterId = chapterId;
  }
}
