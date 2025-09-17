import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class LightGameModuleDetails {}

export class LightMcqChoice {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  // TODO: Remove isCorrect for security reasons
  @ApiProperty()
  isCorrect: boolean;

  constructor(id: string, text: string, isCorrect: boolean) {
    this.id = id;
    this.text = text;
    this.isCorrect = isCorrect;
  }
}

export class LightMcqModuleDetails extends LightGameModuleDetails {
  @ApiProperty()
  question: string;

  @ApiProperty({ type: [LightMcqChoice] })
  choices: LightMcqChoice[];

  constructor(question: string, choices: LightMcqChoice[]) {
    super();
    this.question = question;
    this.choices = choices;
  }
}

export class LightFillInTheBlankChoice {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  // TODO: Remove isCorrect for security reasons
  @ApiProperty()
  isCorrect: boolean;

  constructor(id: string, text: string, isCorrect: boolean) {
    this.id = id;
    this.text = text;
    this.isCorrect = isCorrect;
  }
}

export class LightFillInTheBlankModuleDetails extends LightGameModuleDetails {
  @ApiProperty()
  firstText: string;

  @ApiProperty()
  secondText: string;

  @ApiProperty()
  blanks: LightFillInTheBlankChoice[];

  constructor(
    firstText: string,
    secondText: string,
    blanks: LightFillInTheBlankChoice[],
  ) {
    super();
    this.firstText = firstText;
    this.secondText = secondText;
    this.blanks = blanks;
  }
}

export class LightTrueOrFalseModuleDetails extends LightGameModuleDetails {
  @ApiProperty()
  sentence: string;

  // TODO: Remove isTrue for security reasons
  @ApiProperty()
  isTrue: boolean;

  constructor(sentence: string, isTrue: boolean) {
    super();
    this.sentence = sentence;
    this.isTrue = isTrue;
  }
}

@ApiExtraModels(LightMcqModuleDetails, LightTrueOrFalseModuleDetails)
export class GetLightGameModuleByIdResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(LightMcqModuleDetails) },
      { $ref: getSchemaPath(LightTrueOrFalseModuleDetails) },
    ],
  })
  details: LightGameModuleDetails;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: string,
    lessonId: string,
    details: LightGameModuleDetails,
    updatedAt: Date,
    createdAt: Date,
  ) {
    this.id = id;
    this.lessonId = lessonId;
    this.details = details;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}
