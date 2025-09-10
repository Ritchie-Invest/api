import { ApiProperty } from '@nestjs/swagger';

export class GetLessonByIdResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  chapterId: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty({ type: [Object] })
  modules: unknown[];

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    chapterId: string,
    order: number,
    isPublished: boolean,
    modules: unknown[],
    updatedAt: Date,
    createdAt: Date,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.chapterId = chapterId;
    this.order = order;
    this.isPublished = isPublished;
    this.modules = modules;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}
