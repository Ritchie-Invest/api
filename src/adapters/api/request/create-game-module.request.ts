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

export class CreateGaugeGameModuleContract extends CreateGameModuleContract {
  @ApiProperty()
  question: string;

  @ApiProperty()
  value: number;

  constructor(question: string, value: number) {
    super();
    this.question = question;
    this.value = value;
  }
}

export class CreateChooseAnOrderChoice {
  @ApiProperty()
  sentence: string;

  @ApiProperty()
  value: number;

  constructor(sentence: string, value: number) {
    this.sentence = sentence;
    this.value = value;
  }
}

export class CreateChooseAnOrderGameModuleContract extends CreateGameModuleContract {
  @ApiProperty()
  question: string;

  @ApiProperty({ type: [CreateChooseAnOrderChoice] })
  sentences: CreateChooseAnOrderChoice[];

  constructor(question: string, sentences: CreateChooseAnOrderChoice[]) {
    super();
    this.question = question;
    this.sentences = sentences;
  }
}

@ApiExtraModels(CreateMcqGameModuleContract, CreateGaugeGameModuleContract, CreateChooseAnOrderGameModuleContract)
export class CreateGameModuleRequest {
  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  gameType: GameType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateMcqGameModuleContract) },
      { $ref: getSchemaPath(CreateGaugeGameModuleContract) },
      { $ref: getSchemaPath(CreateChooseAnOrderGameModuleContract) },
    ],
  })
  contract: CreateGameModuleContract;

  constructor(gameType: GameType, contract: CreateGameModuleContract) {
    this.gameType = gameType;
    this.contract = contract;
  }
}
