import { ApiProperty } from '@nestjs/swagger';

export class DeleteLessonResponse {
  @ApiProperty({ description: 'Confirmation message' })
  message: string;

  @ApiProperty({ description: 'ID of the deleted lesson' })
  deletedLessonId: string;

  @ApiProperty({
    description: 'Number of associated games that were also deleted',
  })
  deletedGamesCount: number;

  @ApiProperty({ description: 'Timestamp of deletion' })
  deletedAt: Date;

  constructor(deletedLessonId: string, deletedGamesCount: number = 0) {
    this.message = 'Leçon et jeux associés supprimés avec succès';
    this.deletedLessonId = deletedLessonId;
    this.deletedGamesCount = deletedGamesCount;
    this.deletedAt = new Date();
  }
}
