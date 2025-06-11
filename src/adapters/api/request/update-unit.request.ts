import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class UpdateUnitRequest {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  isPublished: boolean;

  constructor(title: string, description: string, isPublished: boolean) {
    this.title = title;
    this.description = description;
    this.isPublished = isPublished;
  }
}
