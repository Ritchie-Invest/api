import { DomainError } from '../../base/domain-error';

export class GameModuleNotFoundError extends DomainError {
  constructor(moduleId: string) {
    super(`Game module with id ${moduleId} not found`);
  }
}
