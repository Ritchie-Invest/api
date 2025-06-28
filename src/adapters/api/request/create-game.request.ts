import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsObject, IsString } from 'class-validator';
import { GameType } from '../../../core/domain/type/Game/GameType';
import { GameRules } from '../../../core/domain/type/Game/GameRules';
import { Question } from '../../../core/domain/type/Game/Question';

export class CreateGameRequest {
  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  type: GameType;

  @ApiProperty()
  @IsObject()
  rules: GameRules;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  questions: Question[];

  @ApiProperty()
  @IsString()
  lessonId: string;

  @ApiProperty()
  @IsNumber()
  order: number;

  constructor(
    type: GameType,
    rules: GameRules,
    questions: Question[],
    lessonId: string,
    order: number,
  ) {
    this.type = type;
    this.rules = rules;
    this.questions = questions;
    this.lessonId = lessonId;
    this.order = order;
  }
}
