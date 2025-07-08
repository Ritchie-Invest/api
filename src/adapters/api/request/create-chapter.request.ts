import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateChapterRequest {
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

  constructor(title: string, description: string, order: number) {
    this.title = title;
    this.description = description;
    this.order = order;
  }
}
