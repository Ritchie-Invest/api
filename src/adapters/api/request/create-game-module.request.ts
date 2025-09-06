import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { GameType } from '../../../core/domain/type/GameType';
import { IsEnum } from 'class-validator';

export class CreateGameModuleContract {}

export class CreateMcqChoice {
  @ApiProperty()
  text: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  correctionMessage: string;

  constructor(text: string, isCorrect: boolean, correctionMessage: string) {
    this.text = text;
    this.isCorrect = isCorrect;
    this.correctionMessage = correctionMessage;
  }
}
export class CreateMatchChoice {
  @ApiProperty()
  value1: string;

  @ApiProperty()
  value2: string;
  constructor(value1: string, value2: string) {
    this.value1 = value1;
    this.value2 = value2;
  }
}


export class CreateMcqGameModuleContract extends CreateGameModuleContract {
  @ApiProperty()
  question: string;

  @ApiProperty({ type: [CreateMcqChoice] })
  choices: CreateMcqChoice[];

  constructor(question: string, choices: CreateMcqChoice[]) {
    super();
    this.question = question;
    this.choices = choices;
  }
}

@ApiExtraModels(CreateMcqGameModuleContract)
export class CreateGameModuleRequest {
  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  gameType: GameType;

  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(CreateMcqGameModuleContract) }],
  })
  contract: CreateGameModuleContract;

  constructor(gameType: GameType, contract: CreateGameModuleContract) {
    this.gameType = gameType;
    this.contract = contract;
  }
}
