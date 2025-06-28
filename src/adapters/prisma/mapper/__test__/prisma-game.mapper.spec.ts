import { Game as GameEntity, GameType as PrismaGameType } from '@prisma/client';
import { Game } from '../../../../core/domain/model/Game';
import { PrismaGameMapper } from '../prisma-game.mapper';
import { GameType } from '../../../../core/domain/type/Game/GameType';
import { GameRules } from '../../../../core/domain/type/Game/GameRules';
import { Question } from '../../../../core/domain/type/Game/Question';
import { QcmQuestion } from '../../../../core/domain/type/Game/Questions/QCM';

describe('PrismaGameMapper', () => {
  const mapper = new PrismaGameMapper();

  const mockRules: GameRules = {
    shuffle_questions: true,
    time_limit_seconds: 30,
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

  describe('fromDomain', () => {
    it('should map Game to GameEntity', () => {
      // Given
      const game = new Game(
        'game-1',
        GameType.QCM,
        mockRules,
        mockQuestions,
        'lesson-1',
        1,
        true,
        new Date('2023-10-01T12:00:00Z'),
        new Date('2023-10-01T12:00:00Z'),
      );

      // When
      const entity = mapper.fromDomain(game);

      // Then
      expect(entity).toEqual({
        id: 'game-1',
        type: 'QCM' as PrismaGameType,
        rules: mockRules,
        questions: mockQuestions,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      });
    });

    it('should handle optional order field', () => {
      // Given
      const game = new Game(
        'game-2',
        GameType.TRUE_OR_FALSE,
        mockRules,
        mockQuestions,
        'lesson-2',
        undefined,
        false,
        new Date('2023-10-01T12:00:00Z'),
        new Date('2023-10-01T12:00:00Z'),
      );

      // When
      const entity = mapper.fromDomain(game);

      // Then
      expect(entity).toEqual({
        id: 'game-2',
        type: 'TRUE_OR_FALSE' as PrismaGameType,
        rules: mockRules,
        questions: mockQuestions,
        lessonId: 'lesson-2',
        order: 0, 
        isPublished: false,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map GameEntity to Game', () => {
      // Given
      const entity: GameEntity = {
        id: 'game-1',
        type: 'QCM' as PrismaGameType,
        rules: mockRules as any,
        questions: mockQuestions as any,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      };

      // When
      const game = mapper.toDomain(entity);

      // Then
      expect(game).toEqual({
        id: 'game-1',
        type: GameType.QCM,
        rules: mockRules,
        questions: mockQuestions,
        lessonId: 'lesson-1',
        order: 1,
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      });
    });
  });
});
