import { ApiProperty } from '@nestjs/swagger';

export class DeleteGameRequest {
  @ApiProperty({ description: 'ID of the game to delete' })
  gameId: string;

  constructor(gameId: string) {
    this.gameId = gameId;
  }
}
