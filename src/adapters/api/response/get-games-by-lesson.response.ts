import { ApiProperty } from '@nestjs/swagger';
import { GetGameByIdResponse } from './get-game-by-id.response';

export class GetGamesByLessonIdResponse {
  @ApiProperty({ type: [GetGameByIdResponse] })
  games: GetGameByIdResponse[];

  constructor(games: GetGameByIdResponse[]) {
    this.games = games;
  }
}
