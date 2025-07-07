import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from '../question.controller';
import { CompleteQuestionUseCase } from '../../../../core/usecases/complete-question.usecase';
import { CompleteQuestionRequest } from '../../request/complete-question.request';
import { CompleteQuestionResult } from '../../../../core/usecases/complete-question.usecase';
import { QuestionNotFoundError } from '../../../../core/domain/error/QuestionNotFoundError';
import { InvalidAnswerError } from '../../../../core/domain/error/InvalidAnswerError';

describe('QuestionController', () => {
  let controller: QuestionController;
  let completeQuestionUseCase: jest.Mocked<CompleteQuestionUseCase>;

  beforeEach(async () => {
    const mockCompleteQuestionUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [
        {
          provide: CompleteQuestionUseCase,
          useValue: mockCompleteQuestionUseCase,
        },
      ],
    }).compile();

    controller = module.get<QuestionController>(QuestionController);
    completeQuestionUseCase = module.get(CompleteQuestionUseCase);
  });

  describe('completeQuestion', () => {
    it('should return correct answer response when answer is correct', async () => {
      // Given
      const userId = 'user-123';
      const questionId = 'question-456';
      const request = new CompleteQuestionRequest('choice-1');
      const useCaseResult: CompleteQuestionResult = {
        correctAnswer: true,
        feedback: 'Correct! Well done.',
      };

      completeQuestionUseCase.execute.mockResolvedValue(useCaseResult);

      // When
      const response = await controller.completeQuestion(userId, questionId, request);

      // Then
      expect(completeQuestionUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        questionId: 'question-456',
        answer: {
          selectedChoiceId: 'choice-1',
        },
      });
      expect(response.correctAnswer).toBe(true);
      expect(response.feedback).toBe('Correct! Well done.');
    });

    it('should return incorrect answer response when answer is wrong', async () => {
      // Given
      const userId = 'user-123';
      const questionId = 'question-456';
      const request = new CompleteQuestionRequest('choice-2');
      const useCaseResult: CompleteQuestionResult = {
        correctAnswer: false,
        feedback: 'Incorrect. Try again.',
      };

      completeQuestionUseCase.execute.mockResolvedValue(useCaseResult);

      // When
      const response = await controller.completeQuestion(userId, questionId, request);

      // Then
      expect(response.correctAnswer).toBe(false);
      expect(response.feedback).toBe('Incorrect. Try again.');
    });

    it('should throw QuestionNotFoundError when question does not exist', async () => {
      // Given
      const userId = 'user-123';
      const questionId = 'non-existent-question';
      const request = new CompleteQuestionRequest('choice-1');

      completeQuestionUseCase.execute.mockRejectedValue(
        new QuestionNotFoundError(questionId),
      );

      // When & Then
      await expect(
        controller.completeQuestion(userId, questionId, request),
      ).rejects.toThrow(QuestionNotFoundError);
    });

    it('should throw InvalidAnswerError when answer is invalid', async () => {
      // Given
      const userId = 'user-123';
      const questionId = 'question-456';
      const request = new CompleteQuestionRequest('');

      completeQuestionUseCase.execute.mockRejectedValue(
        new InvalidAnswerError(),
      );

      // When & Then
      await expect(
        controller.completeQuestion(userId, questionId, request),
      ).rejects.toThrow(InvalidAnswerError);
    });
  });
});
