import { ApiProperty } from '@nestjs/swagger';

export class UpdateUnitResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  chapterId: string;

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
    chapterId: string,
    isPublished: boolean,
    updatedAt: Date,
    createdAt: Date,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.chapterId = chapterId;
    this.isPublished = isPublished;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}
