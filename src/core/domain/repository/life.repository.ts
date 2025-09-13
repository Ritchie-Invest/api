import { Repository } from '../../base/repository';
import { Life } from '../model/Life';

export type UserLifeData = {
  life_number: number;
  next_life_in: number;
  has_lost: boolean;
};

export abstract class LifeRepository extends Repository<Life> {
  abstract getLastLostLife(userId: string): Promise<Date | null>;
  abstract addLostLife(userId: string): Promise<void>;
  abstract getUserLifeData(userId: string): Promise<UserLifeData>;
}
