import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GameType } from '../../../core/domain/type/GameType';

export class McqAnswerRequest {
  @ApiProperty({
    description: 'The ID of the selected choice',
    example: 'choice-1',
  })
  @IsNotEmpty()
  @IsString()
  choiceId: string;

  constructor(choiceId: string) {
    this.choiceId = choiceId;
  }
}

export class CompleteGameModuleRequest {
  @ApiProperty({
    description: 'Type of the game module being completed',
    enum: GameType,
    example: GameType.MCQ,
  })
  @IsEnum(GameType)
  gameType: GameType;

  @ApiProperty({
    description: 'MCQ answer details (required when gameType is MCQ)',
    type: McqAnswerRequest,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => McqAnswerRequest)
  mcq?: McqAnswerRequest;

  constructor(gameType: GameType, mcq?: McqAnswerRequest) {
    this.gameType = gameType;
    this.mcq = mcq;
  }
}
