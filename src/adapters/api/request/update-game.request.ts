import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';
import { GameType } from '../../../core/domain/type/Game/GameType';
import { GameRules } from '../../../core/domain/type/Game/GameRules';
import { Question } from '../../../core/domain/type/Game/Question';

export class UpdateGameRequest {
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
  @IsBoolean()
  isPublished: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  constructor(
    type: GameType,
    rules: GameRules,
    questions: Question[],
    isPublished: boolean,
    order?: number,
  ) {
    this.type = type;
    this.rules = rules;
    this.questions = questions;
    this.isPublished = isPublished;
    this.order = order;
  }
}
