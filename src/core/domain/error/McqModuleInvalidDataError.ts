import { DomainError } from '../../base/domain-error';

export class McqModuleInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
