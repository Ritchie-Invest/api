import { GameModule } from '../../core/domain/model/GameModule';
import { GameModuleRepository } from '../../core/domain/repository/game-module.repository';

export class InMemoryGameModuleRepository implements GameModuleRepository {
  private modules: Map<string, GameModule> = new Map();

  create(module: GameModule): GameModule {
    this.modules.set(module.id, module);
    return module;
  }

  findAll(): GameModule[] {
    return Array.from(this.modules.values());
  }

  findById(id: string): GameModule | null {
    return this.modules.get(id) || null;
  }

  update(id: string, module: GameModule): GameModule | null {
    if (!this.modules.has(id)) {
      return null;
    }
    this.modules.set(id, module);
    return module;
  }

  remove(id: string): void {
    this.modules.delete(id);
  }

  removeAll(): void {
    this.modules.clear();
  }

  findByLessonId(lessonId: string): GameModule[] {
    return Array.from(this.modules.values()).filter(
      (module) => module.lessonId === lessonId,
    );
  }
}
