import {
  CompleteQuestionUseCase,
  CompleteQuestionCommand,
} from '../complete-question.usecase';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { McqModule } from '../../domain/model/McqModule';
import { McqChoice } from '../../domain/model/McqChoice';
import { QuestionNotFoundError } from '../../domain/error/QuestionNotFoundError';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';
import { Progression, ProgressionType } from '../../domain/model/Progression';
import { InMemoryProgressionRepository } from '../../../adapters/in-memory/in-memory-progression.repository';

describe('CompleteQuestionUseCase', () => {
  let gameModuleRepository: InMemoryGameModuleRepository;
  let progressionRepository: InMemoryProgressionRepository;
  let useCase: CompleteQuestionUseCase;

  beforeEach(() => {
    gameModuleRepository = new InMemoryGameModuleRepository();
    progressionRepository = new InMemoryProgressionRepository();
    useCase = new CompleteQuestionUseCase(
      gameModuleRepository,
      progressionRepository,
    );
    gameModuleRepository.removeAll();
    progressionRepository.removeAll();
  });

  describe('Scenario 1: Valid answer submission', () => {
    it('should return correct answer and feedback when answer is correct', async () => {
      // Given
      const correctChoice = new McqChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct! Paris is indeed the capital of France.',
      });
      
      const incorrectChoice = new McqChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect. Lyon is a major city but not the capital.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });

      await gameModuleRepository.create(mcqModule);

      const command: CompleteQuestionCommand = {
        userId: 'user-1',
        questionId: 'question-1',
        answer: {
          selectedChoiceId: 'choice-1',
        },
      };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.correctAnswer).toBe(true);
      expect(result.feedback).toBe('Correct! Paris is indeed the capital of France.');

      // Verify progression was saved
      const progression = await progressionRepository.findByUserIdAndEntryId(
        'user-1',
        'question-1',
      );
      expect(progression).toBeDefined();
      expect(progression!.userId).toBe('user-1');
      expect(progression!.entryId).toBe('question-1');
      expect(progression!.type).toBe(ProgressionType.QUESTION);
      expect(progression!.completed).toBe(true);
    });

    it('should return incorrect answer and feedback when answer is wrong', async () => {
      // Given
      const correctChoice = new McqChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct! Paris is indeed the capital of France.',
      });
      
      const incorrectChoice = new McqChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect. Lyon is a major city but not the capital.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });

      await gameModuleRepository.create(mcqModule);

      const command: CompleteQuestionCommand = {
        userId: 'user-1',
        questionId: 'question-1',
        answer: {
          selectedChoiceId: 'choice-2',
        },
      };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.correctAnswer).toBe(false);
      expect(result.feedback).toBe('Incorrect. Lyon is a major city but not the capital.');

      // Verify progression was saved with completed = false
      const progression = await progressionRepository.findByUserIdAndEntryId(
        'user-1',
        'question-1',
      );
      expect(progression).toBeDefined();
      expect(progression!.completed).toBe(false);
    });

    it('should update existing progression when user answers again', async () => {
      // Given
      const correctChoice = new McqChoice({
        id: 'choice-1',
        text: 'Paris',
        isCorrect: true,
        correctionMessage: 'Correct!',
      });
      
      const incorrectChoice = new McqChoice({
        id: 'choice-2',
        text: 'Lyon',
        isCorrect: false,
        correctionMessage: 'Incorrect.',
      });

      const mcqModule = new McqModule({
        id: 'question-1',
        lessonId: 'lesson-1',
        question: 'What is the capital of France?',
        choices: [correctChoice, incorrectChoice],
      });

      await gameModuleRepository.create(mcqModule);

      // Create existing progression
      const existingProgression = new Progression(
        'progression-1',
        'user-1',
        'question-1',
        ProgressionType.QUESTION,
        false,
      );
      await progressionRepository.create(existingProgression);

      const command: CompleteQuestionCommand = {
        userId: 'user-1',
        questionId: 'question-1',
        answer: {
          selectedChoiceId: 'choice-1',
        },
      };

      // When
      await useCase.execute(command);

      // Then
      const updatedProgression = await progressionRepository.findByUserIdAndEntryId(
        'user-1',
        'question-1',
      );
      expect(updatedProgression!.completed).toBe(true);
      expect(updatedProgression!.id).toBe('progression-1'); 
    });
  });

describe('Scenario 2: Invalid or empty answer', () => {
    it('should throw InvalidAnswerError when selectedChoiceId is empty', async () => {
        // Given
        const command: CompleteQuestionCommand = {
            userId: 'user-1',
            questionId: 'question-1',
            answer: {
                selectedChoiceId: '',
            },
        };

        // When & Then
        await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
    });

    it('should throw InvalidAnswerError when selectedChoiceId is missing', async () => {
        // Given
        const command = {
            userId: 'user-1',
            questionId: 'question-1',
            answer: {},
        } as CompleteQuestionCommand;

        // When & Then
        await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
    });

    it('should throw InvalidAnswerError when answer is missing', async () => {
        // Given
        const command = {
            userId: 'user-1',
            questionId: 'question-1',
        } as CompleteQuestionCommand;

        // When & Then
        await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
    });

    it('should throw InvalidAnswerError when selectedChoiceId does not exist in question', async () => {
        // Given
        const correctChoice = new McqChoice({
            id: 'choice-1',
            text: 'Paris',
            isCorrect: true,
            correctionMessage: 'Correct!',
        });

        const otherChoice = new McqChoice({
            id: 'choice-2',
            text: 'Lyon',
            isCorrect: false,
            correctionMessage: 'Incorrect.',
        });

        const mcqModule = new McqModule({
            id: 'question-1',
            lessonId: 'lesson-1',
            question: 'What is the capital of France?',
            choices: [correctChoice, otherChoice],
        });

        await gameModuleRepository.create(mcqModule);

        const command: CompleteQuestionCommand = {
            userId: 'user-1',
            questionId: 'question-1',
            answer: {
                selectedChoiceId: 'non-existent-choice',
            },
        };

        // When & Then
        await expect(useCase.execute(command)).rejects.toThrow(InvalidAnswerError);
    });
});

  describe('Scenario 3: Non-existing question', () => {
    it('should throw QuestionNotFoundError when questionId does not exist', async () => {
      // Given
      const command: CompleteQuestionCommand = {
        userId: 'user-1',
        questionId: 'non-existent-question',
        answer: {
          selectedChoiceId: 'choice-1',
        },
      };

      // When & Then
      await expect(useCase.execute(command)).rejects.toThrow(QuestionNotFoundError);
    });
  });
});
