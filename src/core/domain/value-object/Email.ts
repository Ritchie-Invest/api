import { WrongEmailFormatError } from '../error/WrongEmailFormatError';

export class Email {
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private readonly email: string) {
    if (email.length > 256 || !this.EMAIL_REGEX.test(email)) {
      throw new WrongEmailFormatError(email);
    }
  }

  value(): string {
    return this.email;
  }

  normalize(): string {
    return this.email.trim().toLowerCase();
  }
}
