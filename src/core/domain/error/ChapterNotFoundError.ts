import { DomainError } from '../../base/domain-error';

export class ChapterNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Chapter with id ${id} not found`);
  }
}
