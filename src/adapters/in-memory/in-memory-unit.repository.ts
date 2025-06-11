import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../../core/domain/repository/unit.repository';
import { Unit } from '../../core/domain/model/Unit';

@Injectable()
export class InMemoryUnitRepository implements UnitRepository {
  private units: Map<string, Unit> = new Map();

  async create(data: Pick<Unit, 'id' | 'title' | 'description' | 'chapterId'>): Promise<Unit> {
    const unit = new Unit(
      data.id,
      data.title,
      data.description,
      data.chapterId,
    );
    this.units.set(unit.id, unit);
    return unit;
  }

  async findById(id: string): Promise<Unit | null> {
    return this.units.get(id) || null;
  }

  async findAll(): Promise<Unit[]> {
    return Array.from(this.units.values());
  }

  async update(id: string, unit: Unit): Promise<Unit | null> {
    if (!this.units.has(id)) {
      return null;
    }
    this.units.set(id, unit);
    return unit;
  }

  async remove(id: string): Promise<void> {
    this.units.delete(id);
  }

  async removeAll(): Promise<void> {
    this.units.clear();
  }

  async findByChapter(chapterId: string): Promise<Unit[]> {
    return Array.from(this.units.values()).filter(
      (unit) => unit.chapterId === chapterId,
    );
  }
}
