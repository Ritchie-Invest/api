import { ApiProperty } from '@nestjs/swagger';

export class UpdateChapterResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    isPublished: boolean,
    updatedAt: Date,
    createdAt: Date,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.isPublished = isPublished;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}
