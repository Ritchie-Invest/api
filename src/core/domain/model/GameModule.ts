import { GameType } from '../type/GameType';

export abstract class GameModule {
  id: string;
  lessonId: string;
  gameType: GameType;
  updatedAt: Date;
  createdAt: Date;

  protected constructor(params: {
    id: string;
    lessonId: string;
    gameType: GameType;
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    this.id = params.id;
    this.lessonId = params.lessonId;
    this.gameType = params.gameType;
    this.updatedAt = params.updatedAt || new Date();
    this.createdAt = params.createdAt || new Date();
  }
}
