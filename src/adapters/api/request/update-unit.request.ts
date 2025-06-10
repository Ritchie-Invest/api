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
  is_published: boolean;

  constructor(title: string, description: string, is_published: boolean) {
    this.title = title;
    this.description = description;
    this.is_published = is_published;
  }
}
