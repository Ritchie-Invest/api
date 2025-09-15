import { Repository } from '../../base/repository';
import { User } from '../model/User';

export abstract class UserRepository extends Repository<User> {
  abstract findByEmail(email: string): Promise<User | null> | User | null;
  abstract incrementXp(
    userId: string,
    amount: number,
  ): Promise<User | null> | User | null;
}
