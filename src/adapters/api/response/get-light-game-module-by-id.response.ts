import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class GameModuleDetails {}

export class LightMcqChoice {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  isCorrect: boolean;

  constructor(id: string, text: string, isCorrect: boolean) {
    this.id = id;
    this.text = text;
    this.isCorrect = isCorrect;
  }
}

export class McqModuleDetails extends GameModuleDetails {
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

@ApiExtraModels(McqModuleDetails)
export class GetLightGameModuleByIdResponse {
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
