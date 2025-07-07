import { DomainError } from '../../base/domain-error';

export class GameModuleTypeMismatchError extends DomainError {
  constructor() {
    super('Game type does not match the lesson');
  }
}
