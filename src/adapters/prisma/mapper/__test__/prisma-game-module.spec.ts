import {
  GameModule as GameModuleEntity,
  McqModule as McqModuleEntity,
  FillInTheBlankModule as FillInTheBlankModuleEntity,
  TrueOrFalseModule as TrueOrFalseModuleEntity,
} from '@prisma/client';
import { McqModule } from '../../../../core/domain/model/McqModule';
import { FillInTheBlankModule } from '../../../../core/domain/model/FillInTheBlankModule';
import { TrueOrFalseModule } from '../../../../core/domain/model/TrueOrFalseModule';
import { GameChoice } from '../../../../core/domain/model/GameChoice';
import { PrismaGameModuleMapper } from '../prisma-game-module.mapper';

describe('PrismaGameModuleMapper', () => {
  const mapper = new PrismaGameModuleMapper();

  describe('fromDomain', () => {
    it('should throw error - not implemented', () => {
      // Given/When/Then
      expect(() => mapper.fromDomain()).toThrow('Not implemented.');
    });
  });

  describe('toDomain', () => {
    describe('MCQ Module', () => {
      it('should map McqModuleEntity to McqModule', () => {
        // Given
        const mcqEntity: McqModuleEntity = {
          id: 'mcq-1',
          question: 'What is the capital of France?',
          choices: [
            {
              id: 'choice-1',
              text: 'Paris',
              isCorrect: true,
              correctionMessage: 'Correct! Paris is the capital of France.',
            },
            {
              id: 'choice-2',
              text: 'London',
              isCorrect: false,
              correctionMessage: 'Incorrect. London is the capital of the UK.',
            },
          ],
          gameModuleId: 'module-1',
        };

        const gameModuleEntity: GameModuleEntity & { 
          mcq: McqModuleEntity | null;
          fillBlank: FillInTheBlankModuleEntity | null;
          trueOrFalse: TrueOrFalseModuleEntity | null;
        } = {
          id: 'module-1',
          lessonId: 'lesson-1',
          createdAt: new Date('2023-10-01T10:00:00Z'),
          updatedAt: new Date('2023-10-01T11:00:00Z'),
          mcq: mcqEntity,
          fillBlank: null,
          trueOrFalse: null,
        };

        // When
        const result = mapper.toDomain(gameModuleEntity);

        // Then
        expect(result).toBeInstanceOf(McqModule);
        const mcqModule = result as McqModule;
        expect(mcqModule.id).toBe('module-1');
        expect(mcqModule.lessonId).toBe('lesson-1');
        expect(mcqModule.question).toBe('What is the capital of France?');
        expect(mcqModule.choices).toHaveLength(2);
        expect(mcqModule.choices[0]).toBeInstanceOf(GameChoice);
        expect(mcqModule.choices[0]?.id).toBe('choice-1');
        expect(mcqModule.choices[0]?.text).toBe('Paris');
        expect(mcqModule.choices[0]?.isCorrect).toBe(true);
        expect(mcqModule.choices[0]?.correctionMessage).toBe('Correct! Paris is the capital of France.');
        expect(mcqModule.choices[1]?.id).toBe('choice-2');
        expect(mcqModule.choices[1]?.text).toBe('London');
        expect(mcqModule.choices[1]?.isCorrect).toBe(false);
        expect(mcqModule.createdAt).toEqual(new Date('2023-10-01T10:00:00Z'));
        expect(mcqModule.updatedAt).toEqual(new Date('2023-10-01T11:00:00Z'));
      });

      it('should throw error for empty choices array for MCQ and handle GameChoice with null id', () => {
        // Given 
        const mcqEntityWithNullChoices: McqModuleEntity = {
          id: 'mcq-1',
          question: 'Test question?',
          choices: null,
          gameModuleId: 'module-1',
        };

        const gameModuleEntityWithNullChoices: GameModuleEntity & { 
          mcq: McqModuleEntity | null;
          fillBlank: FillInTheBlankModuleEntity | null;
          trueOrFalse: TrueOrFalseModuleEntity | null;
        } = {
          id: 'module-1',
          lessonId: 'lesson-1',
          createdAt: new Date('2023-10-01T10:00:00Z'),
          updatedAt: new Date('2023-10-01T11:00:00Z'),
          mcq: mcqEntityWithNullChoices,
          fillBlank: null,
          trueOrFalse: null,
        };

        // When/Then 
        expect(() => mapper.toDomain(gameModuleEntityWithNullChoices)).toThrow('At least two choices are required');

        // Given
        const mcqEntityWithNullId: McqModuleEntity = {
          id: 'mcq-1',
          question: 'Test question?',
          choices: [
            {
              id: null,
              text: 'Option with null id',
              isCorrect: true,
              correctionMessage: 'Test message',
            },
            {
              id: 'choice-2',
              text: 'Second option',
              isCorrect: false,
              correctionMessage: 'Test message 2',
            },
          ],
          gameModuleId: 'module-1',
        };

        const gameModuleEntityWithNullId: GameModuleEntity & { 
          mcq: McqModuleEntity | null;
          fillBlank: FillInTheBlankModuleEntity | null;
          trueOrFalse: TrueOrFalseModuleEntity | null;
        } = {
          id: 'module-1',
          lessonId: 'lesson-1',
          createdAt: new Date('2023-10-01T10:00:00Z'),
          updatedAt: new Date('2023-10-01T11:00:00Z'),
          mcq: mcqEntityWithNullId,
          fillBlank: null,
          trueOrFalse: null,
        };

        // When/Then 
        const result = mapper.toDomain(gameModuleEntityWithNullId);
        expect(result).toBeInstanceOf(McqModule);
        const mcqModule = result as McqModule;
        expect(mcqModule.choices[0]?.id).toBe('');
        expect(mcqModule.choices[1]?.id).toBe('choice-2');
      });
    });

    describe('Fill in the Blank Module', () => {
      it('should map FillInTheBlankModuleEntity to FillInTheBlankModule', () => {
        // Given
        const fillBlankEntity: FillInTheBlankModuleEntity = {
          id: 'fill-1',
          firstText: 'The capital of France is',
          secondText: 'and it is beautiful.',
          blanks: [
            {
              id: 'blank-1',
              text: 'Paris',
              isCorrect: true,
              correctionMessage: 'Correct! Paris is the capital of France.',
            },
            {
              id: 'blank-2',
              text: 'London',
              isCorrect: false,
              correctionMessage: 'Incorrect. London is the capital of the UK.',
            },
          ],
          gameModuleId: 'module-1',
        };

        const gameModuleEntity: GameModuleEntity & { 
          mcq: McqModuleEntity | null;
          fillBlank: FillInTheBlankModuleEntity | null;
          trueOrFalse: TrueOrFalseModuleEntity | null;
        } = {
          id: 'module-1',
          lessonId: 'lesson-1',
          createdAt: new Date('2023-10-01T10:00:00Z'),
          updatedAt: new Date('2023-10-01T11:00:00Z'),
          mcq: null,
          fillBlank: fillBlankEntity,
          trueOrFalse: null,
        };

        // When
        const result = mapper.toDomain(gameModuleEntity);

        // Then
        expect(result).toBeInstanceOf(FillInTheBlankModule);
        const fillModule = result as FillInTheBlankModule;
        expect(fillModule.id).toBe('module-1');
        expect(fillModule.lessonId).toBe('lesson-1');
        expect(fillModule.firstText).toBe('The capital of France is');
        expect(fillModule.secondText).toBe('and it is beautiful.');
        expect(fillModule.blanks).toHaveLength(2);
        expect(fillModule.blanks[0]).toBeInstanceOf(GameChoice);
        expect(fillModule.blanks[0]?.id).toBe('blank-1');
        expect(fillModule.blanks[0]?.text).toBe('Paris');
        expect(fillModule.blanks[0]?.isCorrect).toBe(true);
        expect(fillModule.blanks[0]?.correctionMessage).toBe('Correct! Paris is the capital of France.');
        expect(fillModule.blanks[1]?.id).toBe('blank-2');
        expect(fillModule.blanks[1]?.text).toBe('London');
        expect(fillModule.blanks[1]?.isCorrect).toBe(false);
        expect(fillModule.createdAt).toEqual(new Date('2023-10-01T10:00:00Z'));
        expect(fillModule.updatedAt).toEqual(new Date('2023-10-01T11:00:00Z'));
      });

      it('should throw error for empty blanks array for Fill in the Blank', () => {
        // Given
        const fillBlankEntity: FillInTheBlankModuleEntity = {
          id: 'fill-1',
          firstText: 'Test first text',
          secondText: 'Test second text',
          blanks: null,
          gameModuleId: 'module-1',
        };

        const gameModuleEntity: GameModuleEntity & { 
          mcq: McqModuleEntity | null;
          fillBlank: FillInTheBlankModuleEntity | null;
          trueOrFalse: TrueOrFalseModuleEntity | null;
        } = {
          id: 'module-1',
          lessonId: 'lesson-1',
          createdAt: new Date('2023-10-01T10:00:00Z'),
          updatedAt: new Date('2023-10-01T11:00:00Z'),
          mcq: null,
          fillBlank: fillBlankEntity,
          trueOrFalse: null,
        };

        // When/Then
        expect(() => mapper.toDomain(gameModuleEntity)).toThrow('At least two blanks are required');
      });
    });

    describe('True or False Module', () => {
      it('should map TrueOrFalseModuleEntity to TrueOrFalseModule', () => {
        // Given
        const trueOrFalseEntity: TrueOrFalseModuleEntity = {
          questions: [
            {
              id: 'question-1',
              text: 'The earth is round',
              isCorrect: true,
              correctionMessage: 'Correct! The earth is indeed round.',
            },
            {
              id: 'question-2',
              text: 'The sun is cold',
              isCorrect: false,
              correctionMessage: 'Incorrect! The sun is actually very hot.',
            },
          ],
          gameModuleId: 'module-1',
        };

        const gameModuleEntity: GameModuleEntity & { 
          mcq: McqModuleEntity | null;
          fillBlank: FillInTheBlankModuleEntity | null;
          trueOrFalse: TrueOrFalseModuleEntity | null;
        } = {
          id: 'module-1',
          lessonId: 'lesson-1',
          createdAt: new Date('2023-10-01T10:00:00Z'),
          updatedAt: new Date('2023-10-01T11:00:00Z'),
          mcq: null,
          fillBlank: null,
          trueOrFalse: trueOrFalseEntity,
        };

        // When
        const result = mapper.toDomain(gameModuleEntity);

        // Then
        expect(result).toBeInstanceOf(TrueOrFalseModule);
        const trueOrFalseModule = result as TrueOrFalseModule;
        expect(trueOrFalseModule.id).toBe('module-1');
        expect(trueOrFalseModule.lessonId).toBe('lesson-1');
        expect(trueOrFalseModule.questions).toHaveLength(2);
        expect(trueOrFalseModule.questions[0]).toBeInstanceOf(GameChoice);
        expect(trueOrFalseModule.questions[0]?.id).toBe('question-1');
        expect(trueOrFalseModule.questions[0]?.text).toBe('The earth is round');
        expect(trueOrFalseModule.questions[0]?.isCorrect).toBe(true);
        expect(trueOrFalseModule.questions[0]?.correctionMessage).toBe('Correct! The earth is indeed round.');
        expect(trueOrFalseModule.questions[1]?.id).toBe('question-2');
        expect(trueOrFalseModule.questions[1]?.text).toBe('The sun is cold');
        expect(trueOrFalseModule.questions[1]?.isCorrect).toBe(false);
        expect(trueOrFalseModule.questions[1]?.correctionMessage).toBe('Incorrect! The sun is actually very hot.');
        expect(trueOrFalseModule.createdAt).toEqual(new Date('2023-10-01T10:00:00Z'));
        expect(trueOrFalseModule.updatedAt).toEqual(new Date('2023-10-01T11:00:00Z'));
      });

      it('should throw error for empty questions array for True or False', () => {
        // Given
        const trueOrFalseEntity: TrueOrFalseModuleEntity = {
          questions: null,
          gameModuleId: 'module-1',
        };

        const gameModuleEntity: GameModuleEntity & { 
          mcq: McqModuleEntity | null;
          fillBlank: FillInTheBlankModuleEntity | null;
          trueOrFalse: TrueOrFalseModuleEntity | null;
        } = {
          id: 'module-1',
          lessonId: 'lesson-1',
          createdAt: new Date('2023-10-01T10:00:00Z'),
          updatedAt: new Date('2023-10-01T11:00:00Z'),
          mcq: null,
          fillBlank: null,
          trueOrFalse: trueOrFalseEntity,
        };

        // When/Then
        expect(() => mapper.toDomain(gameModuleEntity)).toThrow('At least one question is required');
      });
    });

    describe('Error cases', () => {
      it('should throw error when neither mcq nor fillBlank is provided', () => {
        // Given
        const gameModuleEntity: GameModuleEntity & { 
          mcq: McqModuleEntity | null;
          fillBlank: FillInTheBlankModuleEntity | null;
          trueOrFalse: TrueOrFalseModuleEntity | null;
        } = {
          id: 'module-1',
          lessonId: 'lesson-1',
          createdAt: new Date('2023-10-01T10:00:00Z'),
          updatedAt: new Date('2023-10-01T11:00:00Z'),
          mcq: null,
          fillBlank: null,
          trueOrFalse: null,
        };

        // When/Then
        expect(() => mapper.toDomain(gameModuleEntity)).toThrow('Unsupported module entity');
      });
    });
  });
});
