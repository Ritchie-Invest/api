import { ApiProperty } from '@nestjs/swagger';

export class BadgeCatalogItemResponse {
  @ApiProperty({ example: 'LEARN_PERFECT_QUIZ', type: String })
  type: string;

  @ApiProperty({ example: 'Perfect Quiz', type: String })
  name: string;

  @ApiProperty({ example: 'Score 100% on a lesson quiz.', required: false })
  description?: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    required: false,
    type: String,
  })
  awardedAt?: string;

  @ApiProperty({ example: true })
  hasSeen: boolean;

  constructor(
    type: string,
    name: string,
    description: string | undefined,
    awardedAt: string | undefined,
    hasSeen: boolean,
  ) {
    this.type = type;
    this.name = name;
    this.description = description;
    this.awardedAt = awardedAt;
    this.hasSeen = hasSeen;
  }
}
