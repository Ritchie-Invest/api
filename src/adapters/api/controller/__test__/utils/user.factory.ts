import { User } from '../../../../../core/domain/model/User';
import { UserType } from '../../../../../core/domain/type/UserType';
import { Email } from '../../../../../core/domain/value-object/Email';

export class UserFactory {
  static make(overrides?: Partial<User>): User {
    return new User(
      overrides?.id ?? crypto.randomUUID(),
      overrides?.email ?? new Email('user@example.com'),
      overrides?.password ?? 'hashedPassword',
      overrides?.type ?? UserType.STUDENT,
      overrides?.totalXp ?? 0,
      overrides?.isInvestmentUnlocked ?? false,
      overrides?.createdAt ?? new Date(),
      overrides?.updatedAt ?? new Date(),
    );
  }
}
