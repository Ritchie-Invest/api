import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { GameType } from '../../../core/domain/type/GameType';
import { IsEnum } from 'class-validator';

export class UpdateGameModuleContract {}

export class UpdateGameChoice {
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

  @ApiProperty({ type: [UpdateGameChoice] })
  choices: UpdateGameChoice[];

  constructor(question: string, choices: UpdateGameChoice[]) {
    super();
    this.question = question;
    this.choices = choices;
  }
}

export class UpdateFillInTheBlankGameModuleContract extends UpdateGameModuleContract {
  @ApiProperty()
  firstText: string;
  
  @ApiProperty()
  secondText: string;
  
  @ApiProperty({ type: [UpdateGameChoice] })
  blanks: UpdateGameChoice[];
  constructor(firstText: string, secondText: string, blanks: UpdateGameChoice[]) {
    super();
    this.firstText = firstText;
    this.secondText = secondText;
    this.blanks = blanks;
  }
}

export class UpdateTrueOrFalseGameModuleContract extends UpdateGameModuleContract {
  @ApiProperty({ type: [UpdateGameChoice] })
  questions: UpdateGameChoice[];

  constructor(questions: UpdateGameChoice[]) {
    super();
    this.questions = questions;
  }
}

@ApiExtraModels(UpdateMcqGameModuleContract, UpdateFillInTheBlankGameModuleContract, UpdateTrueOrFalseGameModuleContract)
export class UpdateGameModuleRequest {
  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  gameType: GameType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(UpdateMcqGameModuleContract) },
      { $ref: getSchemaPath(UpdateFillInTheBlankGameModuleContract) },
      { $ref: getSchemaPath(UpdateTrueOrFalseGameModuleContract) },
    ],
  })
  contract: UpdateGameModuleContract;

  constructor(gameType: GameType, contract: UpdateMcqGameModuleContract) {
    this.gameType = gameType;
    this.contract = contract;
  }
}
