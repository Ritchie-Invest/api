import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class GameModuleDetails {}

export class LightGameChoice {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  constructor(id: string, text: string) {
    this.id = id;
    this.text = text;
  }
}

export class McqModuleDetails extends GameModuleDetails {
  @ApiProperty()
  question: string;

  @ApiProperty({ type: [LightGameChoice] })
  choices: LightGameChoice[];

  constructor(question: string, choices: LightGameChoice[]) {
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
