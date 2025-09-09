import { DomainError } from '../../base/domain-error';

export class FillInTheBlankModuleInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
