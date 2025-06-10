import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../../core/domain/repository/unit.repository';
import { Unit } from '../../core/domain/model/Unit';

@Injectable()
export class InMemoryUnitRepository implements UnitRepository {
  private units: Map<string, Unit> = new Map();

  create(data: Pick<Unit, 'id' | 'title' | 'description' | 'chapterId'>): Unit {
    const unit = new Unit(
      data.id,
      data.title,
      data.description,
      data.chapterId,
    );
    this.units.set(unit.id, unit);
    return unit;
  }

  findById(id: string): Unit | null {
    return this.units.get(id) || null;
  }

  findAll(): Unit[] {
    return Array.from(this.units.values());
  }

  update(id: string, unit: Unit): Unit | null {
    if (!this.units.has(id)) {
      return null;
    }
    this.units.set(id, unit);
    return unit;
  }

  remove(id: string): void {
    this.units.delete(id);
  }

  removeAll(): void {
    this.units.clear();
  }

  findByChapter(chapterId: string): Promise<Unit[]> {
    return Promise.resolve(
      Array.from(this.units.values()).filter(
        (unit) => unit.chapterId === chapterId,
      ),
    );
  }
}
