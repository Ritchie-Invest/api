import { Repository } from '../../base/repository';
import { User } from '../model/User';
import { Email } from '../value-object/Email';

export abstract class UserRepository extends Repository<User> {
  abstract findByEmail(email: Email): Promise<User | null> | User | null;
  abstract incrementXp(
    userId: string,
    amount: number,
  ): Promise<User | null> | User | null;
}
