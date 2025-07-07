import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
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
  @IsNumber()
  order: number;

  @ApiProperty()
  gameType: GameType;

  constructor(
    title: string,
    description: string,
    chapterId: string,
    order: number,
    gameType: GameType,
  ) {
    this.title = title;
    this.description = description;
    this.chapterId = chapterId;
    this.order = order;
    this.gameType = gameType;
  }
}
