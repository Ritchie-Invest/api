import { DomainError } from '../../base/domain-error';
import { Email } from '../value-object/Email';

export class UserEmailNotFoundError extends DomainError {
  constructor(email: Email) {
    super(`User with email ${email.value()} not found`);
  }
}
