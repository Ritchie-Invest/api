import { CompleteGameModuleMapper } from '../complete-game-module.mapper';
import {
  CompleteGameModuleRequest,
  McqAnswerRequest,
  TrueOrFalseAnswerRequest,
} from '../../request/complete-game-module.request';
import { CompleteGameModuleResult } from '../../../../core/usecases/complete-game-module.use-case';
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

    it('should map request parameters to CompleteGameModuleCommand for true or false game', () => {
      // Given
      const userId = 'user-123';
      const moduleId = 'module-456';
      const request = new CompleteGameModuleRequest(
        GameType.TRUE_OR_FALSE,
        undefined,
        undefined,
        new TrueOrFalseAnswerRequest('question-1', true),
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
        gameType: GameType.TRUE_OR_FALSE,
        trueOrFalse: true,
      });
    });
  });

  describe('fromDomain', () => {
    it('should map CompleteGameModuleResult to CompleteGameModuleResponse for correct answer', () => {
      // Given
      const result: CompleteGameModuleResult = {
        isCorrect: true,
        feedback: 'Correct! Well done.',
        correctChoiceId: 'choice-1',
        nextGameModuleId: 'module-next',
        currentGameModuleIndex: 0,
        totalGameModules: 3,
      };

      // When
      const response = CompleteGameModuleMapper.fromDomain(result);

      // Then
      expect(response.isCorrect).toBe(true);
      expect(response.feedback).toBe('Correct! Well done.');
      expect(response.correctChoiceId).toBe('choice-1');
      expect(response.nextGameModuleId).toBe('module-next');
      expect(response.currentGameModuleIndex).toBe(0);
      expect(response.totalGameModules).toBe(3);
    });

    it('should map CompleteGameModuleResult to CompleteGameModuleResponse for incorrect answer', () => {
      // Given
      const result: CompleteGameModuleResult = {
        isCorrect: false,
        feedback: 'Incorrect. Try again.',
        correctChoiceId: 'choice-1',
        nextGameModuleId: null,
        currentGameModuleIndex: 1,
        totalGameModules: 3,
      };

      // When
      const response = CompleteGameModuleMapper.fromDomain(result);

      // Then
      expect(response.isCorrect).toBe(false);
      expect(response.feedback).toBe('Incorrect. Try again.');
      expect(response.correctChoiceId).toBe('choice-1');
      expect(response.nextGameModuleId).toBe(null);
      expect(response.currentGameModuleIndex).toBe(1);
      expect(response.totalGameModules).toBe(3);
    });
  });
});
