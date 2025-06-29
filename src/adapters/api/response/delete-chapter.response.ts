import { ApiProperty } from '@nestjs/swagger';

export class DeleteChapterResponse {
  @ApiProperty({ description: 'Confirmation message' })
  message: string;

  @ApiProperty({ description: 'ID of the deleted chapter' })
  deletedChapterId: string;

  @ApiProperty({
    description: 'Number of associated games that were also deleted',
  })
  deletedGamesCount: number;

  @ApiProperty({ description: 'Timestamp of deletion' })
  deletedAt: Date;

  constructor(deletedChapterId: string, deletedGamesCount: number = 0) {
    this.message = 'Chapitre et leçons associées supprimés avec succès';
    this.deletedChapterId = deletedChapterId;
    this.deletedGamesCount = deletedGamesCount;
    this.deletedAt = new Date();
  }
}
