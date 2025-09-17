import { Life } from '../model/Life';

export abstract class LifeRepository {
  abstract loseLife(userId: string): Promise<Life>;
  abstract getUserLivesUntil(userId: string, until: Date): Promise<Life[]>;
  abstract getLastLostLife(userId: string): Promise<Life | null>;
  abstract removeAll(): Promise<void> | void;
}
