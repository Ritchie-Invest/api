import { UpdateGameMapper } from '../update-game.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { UpdateGameRequest } from '../../request/update-game.request';
import { Game } from '../../../../core/domain/model/Game';
import { GameType } from '../../../../core/domain/type/Game/GameType';
import { GameRules } from '../../../../core/domain/type/Game/GameRules';
import { Question } from '../../../../core/domain/type/Game/Question';
import { QcmQuestion } from '../../../../core/domain/type/Game/Questions/QCM';

describe('UpdateGameMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest, gameId, and UpdateGameRequest to UpdateGameCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const gameId = 'game-1';
      
      const mockRules: GameRules = {
        shuffle_questions: true,
        time_limit_seconds: 120,
      };

      const mockQuestions: Question[] = [
        {
          question: 'What is 2+2?',
          options: [
            { value: '4', is_valid: true },
            { value: '3', is_valid: false },
          ],
          feedback: 'The correct answer is 4',
        } as QcmQuestion,
      ];

      const request: UpdateGameRequest = {
        type: GameType.QCM,
        rules: mockRules,
        questions: mockQuestions,
        isPublished: true,
        order: 2,
      };

      // When
      const command = UpdateGameMapper.toDomain(
        currentUser,
        gameId,
        request,
      );

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        gameId: 'game-1',
        type: GameType.QCM,
        rules: mockRules,
        questions: mockQuestions,
        isPublished: true,
        order: 2,
      });
    });
  });

  describe('fromDomain', () => {
    it('should map Game to UpdateGameResponse', () => {
      // Given
      const now = new Date();
      const mockRules: GameRules = {
        shuffle_questions: false,
        time_limit_seconds: 60,
      };

      const mockQuestions: Question[] = [
        {
          question: 'Test question?',
          options: [
            { value: 'Yes', is_valid: true },
            { value: 'No', is_valid: false },
          ],
          feedback: 'The correct answer is Yes',
        } as QcmQuestion,
      ];

      const game = new Game(
        'game-1',
        GameType.TRUE_OR_FALSE,
        mockRules,
        mockQuestions,
        'lesson-1',
        3,
        true,
        now,
        now,
      );

      // When
      const response = UpdateGameMapper.fromDomain(game);

      // Then
      expect(response).toEqual({
        id: 'game-1',
        type: GameType.TRUE_OR_FALSE,
        rules: mockRules,
        questions: mockQuestions,
        lessonId: 'lesson-1',
        order: 3,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    it('should handle game with undefined order', () => {
      // Given
      const now = new Date();
      const mockRules: GameRules = {
        shuffle_questions: false,
        time_limit_seconds: 60,
      };

      const mockQuestions: Question[] = [
        {
          question: 'Test question?',
          options: [
            { value: 'Yes', is_valid: true },
            { value: 'No', is_valid: false },
          ],
          feedback: 'The correct answer is Yes',
        } as QcmQuestion,
      ];

      const game = new Game(
        'game-1',
        GameType.QCM,
        mockRules,
        mockQuestions,
        'lesson-1',
        undefined,
        false,
        now,
        now,
      );

      // When
      const response = UpdateGameMapper.fromDomain(game);

      // Then
      expect(response.order).toEqual(0);
    });
  });
});
