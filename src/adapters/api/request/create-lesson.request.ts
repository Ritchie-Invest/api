import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { GameType } from '../../../core/domain/type/GameType';

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
  @IsEnum(GameType)
  gameType: GameType;

  constructor(
    title: string,
    description: string,
    chapterId: string,
    gameType: GameType,
  ) {
    this.title = title;
    this.description = description;
    this.chapterId = chapterId;
    this.gameType = gameType;
  }
}
