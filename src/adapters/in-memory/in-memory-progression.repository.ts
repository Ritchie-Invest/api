import { Injectable } from '@nestjs/common';
import { ProgressionRepository } from '../../core/domain/repository/progression.repository';
import { Progression } from '../../core/domain/model/Progression';

@Injectable()
export class InMemoryProgressionRepository implements ProgressionRepository {
  private progressions: Map<string, Progression> = new Map();

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

  findByUserIdAndEntryId(userId: string, entryId: string): Progression | null {
    for (const progression of this.progressions.values()) {
      if (progression.userId === userId && progression.entryId === entryId) {
        return progression;
      }
    }
    return null;
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
