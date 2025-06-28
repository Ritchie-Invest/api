import { Injectable } from '@nestjs/common';
import { GameRepository } from '../../core/domain/repository/game.repository';
import { Game } from '../../core/domain/model/Game';

@Injectable()
export class InMemoryGameRepository implements GameRepository {
  private games: Map<string, Game> = new Map();

  create(data: Partial<Game>): Game {
    const game = new Game(
      data.id!,
      data.type!,
      data.rules!,
      data.questions!,
      data.lessonId!,
      data.order,
      data.isPublished,
    );
    this.games.set(game.id, game);
    return game;
  }

  findById(id: string): Game | null {
    return this.games.get(id) || null;
  }

  findAll(): Game[] {
    return Array.from(this.games.values());
  }

  findByLesson(lessonId: string): Game[] {
    return Array.from(this.games.values()).filter(
      (game) => game.lessonId === lessonId,
    );
  }

  update(id: string, data: Partial<Game>): Game | null {
    if (!this.games.has(id)) {
      return null;
    }
    const existingGame = this.games.get(id)!;
    const updatedGame = new Game(
      existingGame.id,
      data.type ?? existingGame.type,
      data.rules ?? existingGame.rules,
      data.questions ?? existingGame.questions,
      data.lessonId ?? existingGame.lessonId,
      data.order ?? existingGame.order,
      data.isPublished ?? existingGame.isPublished,
      data.updatedAt ?? new Date(),
      existingGame.createdAt,
    );
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  remove(id: string): void {
    this.games.delete(id);
  }

  removeAll(): void {
    this.games.clear();
  }
}
