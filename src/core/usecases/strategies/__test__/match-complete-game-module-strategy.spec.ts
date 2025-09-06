import { MatchCompleteGameModuleStrategy } from '../match-complete-game-module-strategy';
import { MatchModule } from '../../../domain/model/MatchModule';
import { MatchChoice } from '../../../domain/model/MatchChoice';
import { CompleteGameModuleCommand } from '../../complete-game-module.use-case';
import { GameType } from '../../../domain/type/GameType';
import { InvalidAnswerError } from '../../../domain/error/InvalidAnswerError';

describe('MatchCompleteGameModuleStrategy', () => {
  let strategy: MatchCompleteGameModuleStrategy;

  beforeEach(() => {
    strategy = new MatchCompleteGameModuleStrategy();
  });

  it('should validate correct answers', () => {
    // Given
    const matchModule = new MatchModule({
      id: 'match-1',
      lessonId: 'lesson-1',
      instruction: 'Match animals with their types',
      matches: [
        new MatchChoice({ id: 'choice-1', value1: 'Cat', value2: 'Mammal' }),
        new MatchChoice({ id: 'choice-2', value1: 'Eagle', value2: 'Bird' }),
      ],
    });

    const command: CompleteGameModuleCommand = {
      userId: 'user-1',
      moduleId: 'match-1',
      gameType: GameType.MATCH,
      match: {
        answers: [
          { value1: 'Cat', value2: 'Mammal' },
          { value1: 'Eagle', value2: 'Bird' },
        ],
      },
    };

    // When
    const result = strategy.validate(matchModule, command);

    // Then
    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toBe('Toutes les correspondances sont correctes !');
    expect(result.correctChoiceId).toBe('match-1');
  });

  it('should validate incorrect answers', () => {
    // Given
    const matchModule = new MatchModule({
      id: 'match-1',
      lessonId: 'lesson-1',
      instruction: 'Match animals with their types',
      matches: [
        new MatchChoice({ id: 'choice-1', value1: 'Cat', value2: 'Mammal' }),
        new MatchChoice({ id: 'choice-2', value1: 'Eagle', value2: 'Bird' }),
      ],
    });

    const command: CompleteGameModuleCommand = {
      userId: 'user-1',
      moduleId: 'match-1',
      gameType: GameType.MATCH,
      match: {
        answers: [
          { value1: 'Cat', value2: 'Bird' }, // Wrong
          { value1: 'Eagle', value2: 'Mammal' }, // Wrong
        ],
      },
    };

    // When
    const result = strategy.validate(matchModule, command);

    // Then
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('Correspondances incorrectes');
    expect(result.feedback).toContain('Cat -> Bird');
    expect(result.feedback).toContain('Eagle -> Mammal');
    expect(result.correctChoiceId).toBe('match-1');
  });

  it('should validate partially correct answers', () => {
    // Given
    const matchModule = new MatchModule({
      id: 'match-1',
      lessonId: 'lesson-1',
      instruction: 'Match animals with their types',
      matches: [
        new MatchChoice({ id: 'choice-1', value1: 'Cat', value2: 'Mammal' }),
        new MatchChoice({ id: 'choice-2', value1: 'Eagle', value2: 'Bird' }),
      ],
    });

    const command: CompleteGameModuleCommand = {
      userId: 'user-1',
      moduleId: 'match-1',
      gameType: GameType.MATCH,
      match: {
        answers: [
          { value1: 'Cat', value2: 'Mammal' }, // Correct
          { value1: 'Eagle', value2: 'Mammal' }, // Wrong
        ],
      },
    };

    // When
    const result = strategy.validate(matchModule, command);

    // Then
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('Correspondances incorrectes');
    expect(result.feedback).toContain('Eagle -> Mammal');
    expect(result.feedback).not.toContain('Cat -> Mammal');
  });

  it('should throw InvalidAnswerError if answers are missing', () => {
    // Given
    const matchModule = new MatchModule({
      id: 'match-1',
      lessonId: 'lesson-1',
      instruction: 'Match animals with their types',
      matches: [
        new MatchChoice({ id: 'choice-1', value1: 'Cat', value2: 'Mammal' }),
        new MatchChoice({ id: 'choice-2', value1: 'Eagle', value2: 'Bird' }),
      ],
    });

    const command: CompleteGameModuleCommand = {
      userId: 'user-1',
      moduleId: 'match-1',
      gameType: GameType.MATCH,
    };

    // When & Then
    expect(() => strategy.validate(matchModule, command)).toThrow(
      InvalidAnswerError,
    );
    expect(() => strategy.validate(matchModule, command)).toThrow(
      'Match answers are required',
    );
  });

  it('should throw InvalidAnswerError if answers array is empty', () => {
    // Given
    const matchModule = new MatchModule({
      id: 'match-1',
      lessonId: 'lesson-1',
      instruction: 'Match animals with their types',
      matches: [
        new MatchChoice({ id: 'choice-1', value1: 'Cat', value2: 'Mammal' }),
        new MatchChoice({ id: 'choice-2', value1: 'Eagle', value2: 'Bird' }),
      ],
    });

    const command: CompleteGameModuleCommand = {
      userId: 'user-1',
      moduleId: 'match-1',
      gameType: GameType.MATCH,
      match: {
        answers: [],
      },
    };

    // When & Then
    expect(() => strategy.validate(matchModule, command)).toThrow(
      InvalidAnswerError,
    );
  });

  it('should validate incorrect if wrong number of answers', () => {
    // Given
    const matchModule = new MatchModule({
      id: 'match-1',
      lessonId: 'lesson-1',
      instruction: 'Match animals with their types',
      matches: [
        new MatchChoice({ id: 'choice-1', value1: 'Cat', value2: 'Mammal' }),
        new MatchChoice({ id: 'choice-2', value1: 'Eagle', value2: 'Bird' }),
      ],
    });

    const command: CompleteGameModuleCommand = {
      userId: 'user-1',
      moduleId: 'match-1',
      gameType: GameType.MATCH,
      match: {
        answers: [
          { value1: 'Cat', value2: 'Mammal' }, // Only one answer instead of two
        ],
      },
    };

    // When
    const result = strategy.validate(matchModule, command);

    // Then
    expect(result.isCorrect).toBe(false);
  });
});
