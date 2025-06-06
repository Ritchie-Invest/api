import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateChapterRequest {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
  }
}
