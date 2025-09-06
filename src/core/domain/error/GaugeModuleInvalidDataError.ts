import { DomainError } from '../../base/domain-error';

export class GaugeModuleInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
