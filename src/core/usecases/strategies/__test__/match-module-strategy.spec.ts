import { MatchModuleStrategy } from '../match-module-strategy';
import { CreateGameModuleCommand } from '../../create-game-module.use-case';
import { UpdateGameModuleCommand } from '../../update-game-module.use-case';
import { GameType } from '../../../domain/type/GameType';
import { MatchModule } from '../../../domain/model/MatchModule';
import { MatchChoice } from '../../../domain/model/MatchChoice';
import { MatchModuleInvalidDataError } from '../../../domain/error/MatchModuleInvalidDataError';

describe('MatchModuleStrategy', () => {
  let strategy: MatchModuleStrategy;

  beforeEach(() => {
    strategy = new MatchModuleStrategy();
  });

  describe('createModule', () => {
    it('should create a valid MatchModule', () => {
      // Given
      const command: CreateGameModuleCommand = {
        lessonId: 'lesson-1',
        gameType: GameType.MATCH,
        match: {
          instruction: 'Match the words with their meanings',
          matches: [
            { value1: 'Cat', value2: 'Animal' },
            { value1: 'Blue', value2: 'Color' },
          ],
        },
      };

      // When
      const result = strategy.createModule(command);

      // Then
      expect(result).toBeInstanceOf(MatchModule);
      expect(result.lessonId).toBe('lesson-1');
      expect((result as MatchModule).instruction).toBe('Match the words with their meanings');
      expect((result as MatchModule).matches).toHaveLength(2);
      expect((result as MatchModule).matches[0]?.value1).toBe('Cat');
      expect((result as MatchModule).matches[0]?.value2).toBe('Animal');
    });

    it('should throw MatchModuleInvalidDataError if match data is missing', () => {
      // Given
      const command: CreateGameModuleCommand = {
        lessonId: 'lesson-1',
        gameType: GameType.MATCH,
      };

      // When & Then
      expect(() => strategy.createModule(command)).toThrow(
        MatchModuleInvalidDataError,
      );
    });

    it('should throw MatchModuleInvalidDataError if instruction is missing', () => {
      // Given
      const command: CreateGameModuleCommand = {
        lessonId: 'lesson-1',
        gameType: GameType.MATCH,
        match: {
          instruction: '',
          matches: [{ value1: 'Cat', value2: 'Animal' }],
        },
      };

      // When & Then
      expect(() => strategy.createModule(command)).toThrow(
        MatchModuleInvalidDataError,
      );
    });

    it('should throw MatchModuleInvalidDataError if matches are missing', () => {
      // Given
      const command: CreateGameModuleCommand = {
        lessonId: 'lesson-1',
        gameType: GameType.MATCH,
        match: {
          instruction: 'Test instruction',
          matches: [],
        },
      };

      // When & Then
      expect(() => strategy.createModule(command)).toThrow(
        MatchModuleInvalidDataError,
      );
    });
  });

  describe('updateModule', () => {
    it('should update a MatchModule', () => {
      // Given
      const existingModule = new MatchModule({
        id: 'module-1',
        lessonId: 'lesson-1',
        instruction: 'Old instruction',
        matches: [
          new MatchChoice({ id: 'match-1', value1: 'Old1', value2: 'Old2' }),
          new MatchChoice({ id: 'match-2', value1: 'Old3', value2: 'Old4' }),
        ],
      });

      const command: UpdateGameModuleCommand = {
        gameModuleId: 'module-1',
        match: {
          instruction: 'New instruction',
          matches: [
            { value1: 'Dog', value2: 'Pet' },
            { value1: 'Red', value2: 'Color' },
          ],
        },
      };

      // When
      const result = strategy.updateModule(existingModule, command);

      // Then
      expect(result).toBeInstanceOf(MatchModule);
      expect(result.id).toBe('module-1');
      expect(result.lessonId).toBe('lesson-1');
      expect((result as MatchModule).instruction).toBe('New instruction');
      expect((result as MatchModule).matches).toHaveLength(2);
      expect((result as MatchModule).matches[0]?.value1).toBe('Dog');
      expect((result as MatchModule).matches[0]?.value2).toBe('Pet');
    });

    it('should throw MatchModuleInvalidDataError if match data is missing during update', () => {
      // Given
      const existingModule = new MatchModule({
        id: 'module-1',
        lessonId: 'lesson-1',
        instruction: 'Old instruction',
        matches: [
          new MatchChoice({ id: 'match-1', value1: 'Old1', value2: 'Old2' }),
          new MatchChoice({ id: 'match-2', value1: 'Old3', value2: 'Old4' }),
        ],
      });

      const command: UpdateGameModuleCommand = {
        gameModuleId: 'module-1',
      };

      // When & Then
      expect(() => strategy.updateModule(existingModule, command)).toThrow(
        MatchModuleInvalidDataError,
      );
    });
  });
});
