import { DomainError } from '../../base/domain-error';

export class LessonOrderConflictError extends DomainError {
  constructor(order: number, chapterId: string) {
    super(
      `A lesson with order ${order} already exists in chapter ${chapterId}`,
    );
  }
}
