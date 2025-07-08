import { DomainError } from '../../base/domain-error';

export class InvalidAnswerError extends DomainError {
  constructor(message: string = 'Invalid or empty answer provided') {
    super(message);
  }
}
