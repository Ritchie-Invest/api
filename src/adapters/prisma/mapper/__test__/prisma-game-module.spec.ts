import { PrismaGameModuleMapper } from '../prisma-game-module.mapper';
import { McqModule } from '../../../../core/domain/model/McqModule';
import { MatchModule } from '../../../../core/domain/model/MatchModule';

describe('PrismaGameModuleMapper', () => {
  let mapper: PrismaGameModuleMapper;

  beforeEach(() => {
    mapper = new PrismaGameModuleMapper();
  });

  describe('toDomain', () => {
    it('should map McqModule entity to domain model', () => {
      // Given
      const entity = {
        id: 'module-1',
        lessonId: 'lesson-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        mcq: {
          id: 'mcq-1',
          question: 'What is 2+2?',
          choices: [
            {
              id: 'choice-1',
              text: '4',
              isCorrect: true,
              correctionMessage: 'Correct!',
            },
            {
              id: 'choice-2',
              text: '5',
              isCorrect: false,
              correctionMessage: 'Wrong!',
            },
          ],
          gameModuleId: 'module-1',
        },
        match: null,
      };

      // When
      const result = mapper.toDomain(entity);

      // Then
      expect(result).toBeInstanceOf(McqModule);
      expect(result.id).toBe('module-1');
      expect(result.lessonId).toBe('lesson-1');
      expect((result as McqModule).question).toBe('What is 2+2?');
      expect((result as McqModule).choices).toHaveLength(2);
    });

    it('should map MatchModule entity to domain model', () => {
      // Given
      const entity = {
        id: 'module-2',
        lessonId: 'lesson-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        mcq: null,
        match: {
          id: 'match-1',
          instruction: 'Match animals with their types',
          matches: [
            {
              id: 'match-choice-1',
              value1: 'Cat',
              value2: 'Mammal',
            },
            {
              id: 'match-choice-2',
              value1: 'Eagle',
              value2: 'Bird',
            },
          ],
          gameModuleId: 'module-2',
        },
      };

      // When
      const result = mapper.toDomain(entity);

      // Then
      expect(result).toBeInstanceOf(MatchModule);
      expect(result.id).toBe('module-2');
      expect(result.lessonId).toBe('lesson-1');
      expect((result as MatchModule).instruction).toBe('Match animals with their types');
      expect((result as MatchModule).matches).toHaveLength(2);
      expect((result as MatchModule).matches[0]?.value1).toBe('Cat');
      expect((result as MatchModule).matches[0]?.value2).toBe('Mammal');
    });

    it('should throw error for unsupported module entity', () => {
      // Given
      const entity = {
        id: 'module-3',
        lessonId: 'lesson-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        mcq: null,
        match: null,
      };

      // When & Then
      expect(() => mapper.toDomain(entity)).toThrow('Unsupported module entity');
    });
  });
});
