import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '../../../core/domain/type/Game/GameType';
import { GameRules } from '../../../core/domain/type/Game/GameRules';
import { Question } from '../../../core/domain/type/Game/Question';

export class GetGameByIdResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: GameType })
  type: GameType;

  @ApiProperty()
  rules: GameRules;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  questions: Question[];

  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: string,
    type: GameType,
    rules: GameRules,
    questions: Question[],
    lessonId: string,
    order: number,
    isPublished: boolean,
    updatedAt: Date,
    createdAt: Date,
  ) {
    this.id = id;
    this.type = type;
    this.rules = rules;
    this.questions = questions;
    this.lessonId = lessonId;
    this.order = order;
    this.isPublished = isPublished;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}
