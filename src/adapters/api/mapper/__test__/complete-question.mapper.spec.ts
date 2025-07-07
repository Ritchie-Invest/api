import { CompleteQuestionMapper } from '../complete-question.mapper';
import { CompleteQuestionRequest } from '../../request/complete-question.request';
import { CompleteQuestionResult } from '../../../../core/usecases/complete-question.usecase';

describe('CompleteQuestionMapper', () => {
  describe('toDomain', () => {
    it('should map request parameters to CompleteQuestionCommand', () => {
      // Given
      const userId = 'user-123';
      const questionId = 'question-456';
      const request = new CompleteQuestionRequest('choice-1');

      // When
      const command = CompleteQuestionMapper.toDomain(userId, questionId, request);

      // Then
      expect(command).toEqual({
        userId: 'user-123',
        questionId: 'question-456',
        answer: {
          selectedChoiceId: 'choice-1',
        },
      });
    });
  });

  describe('fromDomain', () => {
    it('should map CompleteQuestionResult to CompleteQuestionResponse for correct answer', () => {
      // Given
      const result: CompleteQuestionResult = {
        correctAnswer: true,
        feedback: 'Correct! Well done.',
      };

      // When
      const response = CompleteQuestionMapper.fromDomain(result);

      // Then
      expect(response.correctAnswer).toBe(true);
      expect(response.feedback).toBe('Correct! Well done.');
    });

    it('should map CompleteQuestionResult to CompleteQuestionResponse for incorrect answer', () => {
      // Given
      const result: CompleteQuestionResult = {
        correctAnswer: false,
        feedback: 'Incorrect. Try again.',
      };

      // When
      const response = CompleteQuestionMapper.fromDomain(result);

      // Then
      expect(response.correctAnswer).toBe(false);
      expect(response.feedback).toBe('Incorrect. Try again.');
    });
  });
});
