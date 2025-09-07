import { DomainError } from '../../base/domain-error';

export class ChooseAnOrderModuleInvalidDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
