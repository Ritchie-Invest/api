import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { GameType } from '../../../core/domain/type/GameType';
import { IsEnum } from 'class-validator';

export class UpdateGameModuleContract {}

export class UpdateMcqChoice {
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

export class UpdateMcqGameModuleContract extends UpdateGameModuleContract {
  @ApiProperty()
  question: string;

  @ApiProperty({ type: [UpdateMcqChoice] })
  choices: UpdateMcqChoice[];

  constructor(question: string, choices: UpdateMcqChoice[]) {
    super();
    this.question = question;
    this.choices = choices;
  }
}

export class UpdateMatchChoice {
  @ApiProperty()
  value1: string;
  @ApiProperty()
  value2: string;
  constructor(value1: string, value2: string) {
    this.value1 = value1;
    this.value2 = value2;
  }
}
export class UpdateMatchGameModuleContract extends UpdateGameModuleContract {
  @ApiProperty()
  instruction: string;
  @ApiProperty({ type: [UpdateMatchChoice] })
  matches: UpdateMatchChoice[];
  constructor(instruction: string, matches: UpdateMatchChoice[]) {
    super();
    this.instruction = instruction;
    this.matches = matches;
  }
}

@ApiExtraModels(UpdateMcqGameModuleContract)
export class UpdateGameModuleRequest {
  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  gameType: GameType;

  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(UpdateMcqGameModuleContract) }],
  })
  contract: UpdateGameModuleContract;

  constructor(gameType: GameType, contract: UpdateMcqGameModuleContract) {
    this.gameType = gameType;
    this.contract = contract;
  }
}
