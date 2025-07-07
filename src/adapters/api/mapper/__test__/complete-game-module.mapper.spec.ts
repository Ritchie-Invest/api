import { CompleteGameModuleMapper } from '../complete-game-module.mapper';
import {
  CompleteGameModuleRequest,
  McqAnswerRequest,
} from '../../request/complete-game-module.request';
import { CompleteGameModuleResult } from '../../../../core/usecases/complete-game-module.usecase';
import { GameType } from '../../../../core/domain/type/GameType';

describe('CompleteGameModuleMapper', () => {
  describe('toDomain', () => {
    it('should map request parameters to CompleteGameModuleCommand', () => {
      // Given
      const userId = 'user-123';
      const moduleId = 'module-456';
      const request = new CompleteGameModuleRequest(
        GameType.MCQ,
        new McqAnswerRequest('choice-1'),
      );

      // When
      const command = CompleteGameModuleMapper.toDomain(
        userId,
        moduleId,
        request,
      );

      // Then
      expect(command).toEqual({
        userId: 'user-123',
        moduleId: 'module-456',
        gameType: GameType.MCQ,
        mcq: {
          choiceId: 'choice-1',
        },
      });
    });
  });

  describe('fromDomain', () => {
    it('should map CompleteGameModuleResult to CompleteGameModuleResponse for correct answer', () => {
      // Given
      const result: CompleteGameModuleResult = {
        correctAnswer: true,
        feedback: 'Correct! Well done.',
      };

      // When
      const response = CompleteGameModuleMapper.fromDomain(result);

      // Then
      expect(response.correctAnswer).toBe(true);
      expect(response.feedback).toBe('Correct! Well done.');
    });

    it('should map CompleteGameModuleResult to CompleteGameModuleResponse for incorrect answer', () => {
      // Given
      const result: CompleteGameModuleResult = {
        correctAnswer: false,
        feedback: 'Incorrect. Try again.',
      };

      // When
      const response = CompleteGameModuleMapper.fromDomain(result);

      // Then
      expect(response.correctAnswer).toBe(false);
      expect(response.feedback).toBe('Incorrect. Try again.');
    });
  });
});
