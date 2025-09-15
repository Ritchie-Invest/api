import { DomainError } from '../../base/domain-error';

export class TrueOrFalseModuleInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
