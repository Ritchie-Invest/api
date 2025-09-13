import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateLessonRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  constructor(title: string, description: string, isPublished: boolean) {
    this.title = title;
    this.description = description;
    this.isPublished = isPublished;
  }
}
