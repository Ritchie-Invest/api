import { DomainError } from '../../base/domain-error';

export class LessonNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Lesson with id ${id} not found`);
  }
}
