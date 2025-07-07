import { CompleteQuestionCommand, CompleteQuestionResult } from '../../../core/usecases/complete-question.usecase';
import { CompleteQuestionRequest } from '../request/complete-question.request';
import { CompleteQuestionResponse } from '../response/complete-question.response';

export class CompleteQuestionMapper {
  static toDomain(
    userId: string,
    questionId: string,
    request: CompleteQuestionRequest,
  ): CompleteQuestionCommand {
    return {
      userId,
      questionId,
      answer: {
        selectedChoiceId: request.selectedChoiceId,
      },
    };
  }

  static fromDomain(result: CompleteQuestionResult): CompleteQuestionResponse {
    return new CompleteQuestionResponse(
      result.correctAnswer,
      result.feedback,
    );
  }
}
