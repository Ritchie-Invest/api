import { Repository } from '../../base/repository';
import { Progression } from '../model/Progression';

export abstract class ProgressionRepository extends Repository<Progression> {
  abstract findByUserIdAndEntryId(
    userId: string,
    entryId: string,
  ): Promise<Progression | null> | Progression | null;
}
