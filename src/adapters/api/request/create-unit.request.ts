import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUnitRequest {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  chapterId: string;

  constructor(title: string, description: string, chapterId: string) {
    this.title = title;
    this.description = description;
    this.chapterId = chapterId;
  }
}
