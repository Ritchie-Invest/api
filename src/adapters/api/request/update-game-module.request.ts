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

export class UpdateFillInTheBlankChoice {
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

export class UpdateFillInTheBlankGameModuleContract extends UpdateGameModuleContract {
  @ApiProperty()
  firstText: string;

  @ApiProperty()
  secondText: string;

  @ApiProperty({ type: [UpdateFillInTheBlankChoice] })
  blanks: UpdateFillInTheBlankChoice[];
  constructor(
    firstText: string,
    secondText: string,
    blanks: UpdateFillInTheBlankChoice[],
  ) {
    super();
    this.firstText = firstText;
    this.secondText = secondText;
    this.blanks = blanks;
  }
}

export class UpdateTrueOrFalseGameModuleContract extends UpdateGameModuleContract {
  @ApiProperty()
  sentence: string;

  @ApiProperty()
  isTrue: boolean;

  constructor(sentence: string, isTrue: boolean) {
    super();
    this.sentence = sentence;
    this.isTrue = isTrue;
  }
}

@ApiExtraModels(
  UpdateMcqGameModuleContract,
  UpdateFillInTheBlankGameModuleContract,
  UpdateTrueOrFalseGameModuleContract,
)
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
