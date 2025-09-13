import { ApiProperty } from '@nestjs/swagger';

export class BadgeCatalogItemResponse {
  @ApiProperty({ example: 'LEARN_PERFECT_QUIZ' })
  type: string;

  @ApiProperty({ example: 'Perfect Quiz' })
  name: string;

  @ApiProperty({ example: '/badges/learn_perfect_quiz.svg' })
  iconPath: string;

  @ApiProperty({ example: 'Score 100% on a lesson quiz.', required: false })
  description?: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z', required: false })
  awardedAt?: string;

  constructor(
    type: string,
    name: string,
    iconPath: string,
    description?: string,
    awardedAt?: string,
  ) {
    this.type = type;
    this.name = name;
    this.iconPath = iconPath;
    this.description = description;
    this.awardedAt = awardedAt;
  }
}
