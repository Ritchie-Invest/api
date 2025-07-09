import { DomainError } from '../../base/domain-error';

export class ChapterOrderConflictError extends DomainError {
  constructor(order: number) {
    super(`A chapter with order ${order} already exists`);
  }
}
