import { DomainError } from '../../base/domain-error';

export class GameInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
