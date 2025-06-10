import { ApiProperty } from '@nestjs/swagger';

export class GetUnitByIdResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  chapterId: string;

  @ApiProperty()
  is_published: boolean;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    chapterId: string,
    is_published: boolean,
    updatedAt: Date,
    createdAt: Date,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.chapterId = chapterId;
    this.is_published = is_published;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}
