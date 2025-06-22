import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateLessonRequest {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  chapterId: string;

  @ApiProperty()
  @IsNumber()
  order: number;

  constructor(title: string, description: string, chapterId: string, order: number) {
    this.title = title;
    this.description = description;
    this.chapterId = chapterId;
    this.order = order;
  }
}
