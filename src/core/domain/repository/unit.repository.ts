import { Repository } from '../../base/repository';
import { Unit } from '../model/Unit';

export abstract class UnitRepository extends Repository<Unit> {
  abstract findByChapter(chapterId: string): Promise<Unit[]> | Unit[];
}
