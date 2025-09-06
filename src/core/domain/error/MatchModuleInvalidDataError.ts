import { DomainError } from '../../base/domain-error';

export class MatchModuleInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
