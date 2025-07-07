import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { GameType } from '../../../core/domain/type/GameType';
import { IsEnum } from 'class-validator';

export abstract class GameModuleContract {}

export class McqGameModuleContract extends GameModuleContract {
  question: string;
  choices: {
    text: string;
    isCorrect: boolean;
    correctionMessage: string;
  }[];

  constructor(
    question: string,
    choices: {
      text: string;
      isCorrect: boolean;
      correctionMessage: string;
    }[],
  ) {
    super();
    this.question = question;
    this.choices = choices;
  }
}

@ApiExtraModels(McqGameModuleContract)
export class CreateGameModuleRequest {
  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  gameType: GameType;

  @ApiProperty({ oneOf: [{ $ref: getSchemaPath(McqGameModuleContract) }] })
  contract: GameModuleContract;

  constructor(gameType: GameType, contract: GameModuleContract) {
    this.gameType = gameType;
    this.contract = contract;
  }
}
