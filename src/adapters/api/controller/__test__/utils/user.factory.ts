import { User } from '../../../../../core/domain/model/User';
import { UserType } from '../../../../../core/domain/type/UserType';

export class UserFactory {
  static make(overrides?: Partial<User>): User {
    return new User(
      overrides?.id ?? crypto.randomUUID(),
      overrides?.email ?? 'user@example.com',
      overrides?.password ?? 'hashedPassword',
      overrides?.type ?? UserType.STUDENT,
      overrides?.xp ?? 0,
      overrides?.createdAt ?? new Date(),
      overrides?.updatedAt ?? new Date(),
    );
  }
}
