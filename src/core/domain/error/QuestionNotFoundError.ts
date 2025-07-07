import { DomainError } from '../../base/domain-error';

export class QuestionNotFoundError extends DomainError {
  constructor(questionId: string) {
    super(`Question with id ${questionId} not found`);
  }
}
