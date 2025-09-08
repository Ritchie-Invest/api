import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class GameModuleDetails {}

export class McqChoice {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  correctionMessage: string;

  constructor(
    id: string,
    text: string,
    isCorrect: boolean,
    correctionMessage: string,
  ) {
    this.id = id;
    this.text = text;
    this.isCorrect = isCorrect;
    this.correctionMessage = correctionMessage;
  }
}

export class McqModuleDetails extends GameModuleDetails {
  @ApiProperty()
  question: string;

  @ApiProperty({ type: [McqChoice] })
  choices: McqChoice[];

  constructor(question: string, choices: McqChoice[]) {
    super();
    this.question = question;
    this.choices = choices;
  }
}

@ApiExtraModels(McqModuleDetails)
export class GetGameModuleByIdResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty({ oneOf: [{ $ref: getSchemaPath(McqModuleDetails) }] })
  details: GameModuleDetails;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: string,
    lessonId: string,
    details: GameModuleDetails,
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
