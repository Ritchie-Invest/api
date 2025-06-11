import { DomainError } from '../../base/domain-error';

export class UnitNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Unit with id ${id} not found`);
  }
}
