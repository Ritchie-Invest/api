import { Injectable } from '@nestjs/common';
import { ProgressionRepository } from '../../core/domain/repository/progression.repository';
import { Progression } from '../../core/domain/model/Progression';
import { GameModuleRepository } from '../../core/domain/repository/game-module.repository';

@Injectable()
export class InMemoryProgressionRepository implements ProgressionRepository {
  private progressions: Map<string, Progression> = new Map();

  constructor(private readonly gameModuleRepository: GameModuleRepository) {}

  create(data: Progression): Progression {
    this.progressions.set(data.id, data);
    return data;
  }

  findAll(): Progression[] {
    return Array.from(this.progressions.values());
  }

  findById(id: string): Progression | null {
    return this.progressions.get(id) || null;
  }

  findByUserIdAndGameModuleId(
    userId: string,
    gameModuleId: string,
  ): Progression | null {
    return (
      Array.from(this.progressions.values()).find(
        (progression) =>
          progression.userId === userId &&
          progression.gameModuleId === gameModuleId,
      ) || null
    );
  }

  async findByUserIdAndLessonId(
    userId: string,
    lessonId: string,
  ): Promise<Progression[]> {
    const progressions = Array.from(this.progressions.values());
    const filteredProgressions: Progression[] = [];

    for (const progression of progressions) {
      const gameModule = await this.gameModuleRepository.findById(
        progression.gameModuleId,
      );
      if (
        gameModule &&
        progression.userId === userId &&
        gameModule.lessonId === lessonId
      ) {
        filteredProgressions.push(progression);
      }
    }

    return filteredProgressions;
  }

  update(id: string, data: Progression): Progression | null {
    if (!this.progressions.has(id)) {
      return null;
    }
    this.progressions.set(id, data);
    return data;
  }

  remove(id: string): void {
    this.progressions.delete(id);
  }

  removeAll(): void {
    this.progressions.clear();
  }
}
