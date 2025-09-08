import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { GameType } from '../../../core/domain/type/GameType';
import { IsEnum } from 'class-validator';

export class CreateGameModuleContract {}

export class CreateGameChoice {
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

export class CreateMcqGameModuleContract extends CreateGameModuleContract {
  @ApiProperty()
  question: string;

  @ApiProperty({ type: [CreateGameChoice] })
  choices: CreateGameChoice[];

  constructor(question: string, choices: CreateGameChoice[]) {
    super();
    this.question = question;
    this.choices = choices;
  }
}

export class CreateFillInTheBlankGameModuleContract extends CreateGameModuleContract {
  @ApiProperty()
  firstText: string;

  @ApiProperty()
  secondText: string;

  @ApiProperty({ type: [CreateGameChoice] })
  blanks: CreateGameChoice[];

  constructor(
    firstText: string,
    secondText: string,
    blanks: CreateGameChoice[],
  ) {
    super();
    this.firstText = firstText;
    this.secondText = secondText;
    this.blanks = blanks;
  }
}

export class CreateTrueOrFalseGameModuleContract extends CreateGameModuleContract {
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
  CreateMcqGameModuleContract,
  CreateFillInTheBlankGameModuleContract,
  CreateTrueOrFalseGameModuleContract,
)
export class CreateGameModuleRequest {
  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  gameType: GameType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateMcqGameModuleContract) },
      { $ref: getSchemaPath(CreateFillInTheBlankGameModuleContract) },
      { $ref: getSchemaPath(CreateTrueOrFalseGameModuleContract) },
    ],
  })
  contract: CreateGameModuleContract;

  constructor(gameType: GameType, contract: CreateGameModuleContract) {
    this.gameType = gameType;
    this.contract = contract;
  }
}
