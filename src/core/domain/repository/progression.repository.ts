import { Repository } from '../../base/repository';
import { Progression } from '../model/Progression';

export abstract class ProgressionRepository extends Repository<Progression> {
  abstract findByUserIdAndGameModuleId(
    userId: string,
    gameModuleId: string,
  ): Promise<Progression | null> | Progression | null;
}
