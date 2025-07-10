import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsNumber, Min } from 'class-validator';

export class UpdateChapterRequest {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  order: number;

  @ApiProperty()
  @IsBoolean()
  isPublished: boolean;

  constructor(
    title: string,
    description: string,
    order: number,
    isPublished: boolean,
  ) {
    this.title = title;
    this.description = description;
    this.order = order;
    this.isPublished = isPublished;
  }
}
