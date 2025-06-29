import { ApiProperty } from '@nestjs/swagger';

export class DeleteGameResponse {
  @ApiProperty({ description: 'Confirmation message' })
  message: string;

  @ApiProperty({ description: 'ID of the deleted game' })
  deletedGameId: string;

  @ApiProperty({ description: 'Timestamp of deletion' })
  deletedAt: Date;

  constructor(deletedGameId: string) {
    this.message = 'Jeu supprimé avec succès';
    this.deletedGameId = deletedGameId;
    this.deletedAt = new Date();
  }
}
