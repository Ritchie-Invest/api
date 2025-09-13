import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class UpdateChapterRequest {
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
