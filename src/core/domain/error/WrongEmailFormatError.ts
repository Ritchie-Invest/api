import { DomainError } from '../../base/domain-error';

export class WrongEmailFormatError extends DomainError {
  constructor(email: string) {
    super(`Email ${email} is not in a valid format`);
  }
}
