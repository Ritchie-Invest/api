import { DomainError } from '../../base/domain-error';

export class GameNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Game with id ${id} not found`);
  }
}
