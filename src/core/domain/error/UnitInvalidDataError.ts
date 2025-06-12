import { DomainError } from '../../base/domain-error';

export class UnitInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
