import {
  CreateLessonCommand,
  CreateLessonUseCase,
} from '../create-lesson.use-case';
import { UserType } from '../../domain/type/UserType';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { LessonRepository } from '../../domain/repository/lesson.repository';

import { OrderValidationInterface } from '../../domain/service/order-validation.service';
import { InMemoryOrderValidationService } from '../../../adapters/in-memory/in-memory-order-validation.service';
import { GameType } from '../../domain/type/GameType';
import { LessonOrderConflictError } from '../../domain/error/LessonOrderConflictError';

describe('CreateLessonUseCase', () => {
  let useCase: CreateLessonUseCase;
  let lessonRepository: LessonRepository;
  let OrderValidation: OrderValidationInterface;

  beforeEach(() => {
    lessonRepository = new InMemoryLessonRepository();
    OrderValidation = new InMemoryOrderValidationService();
    useCase = new CreateLessonUseCase(lessonRepository, OrderValidation);
  });

  it('should create a lesson When user is admin', async () => {
    // Given
    const command: CreateLessonCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Lesson 1',
      description: 'Description',
      chapterId: 'chapter-1',
      order: 1,
      gameType: GameType.MCQ,
    };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result.title).toBe(command.title);
    expect(result.description).toBe(command.description);
    expect(result.chapterId).toBe(command.chapterId);
    expect(result.order).toBe(command.order);
    const lessons = await lessonRepository.findAll();
    expect(lessons.length).toBe(1);
  });

  it('should throw UserNotAllowedError if user is not admin', async () => {
    // Given
    const command: CreateLessonCommand = {
      currentUser: { id: 'user-id', type: UserType.STUDENT },
      title: 'Lesson 1',
      description: 'Description',
      chapterId: 'chapter-1',
      order: 1,
      gameType: GameType.MCQ,
    };

    // Then
    await expect(useCase.execute(command)).rejects.toThrow(UserNotAllowedError);
    const lessons = await lessonRepository.findAll();
    expect(lessons.length).toBe(0);
  });

  it('should throw an error when trying to create a lesson with an order that already exists in the same chapter', async () => {
    // Given
    const firstCommand: CreateLessonCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Première leçon',
      description: 'Description de la première leçon',
      chapterId: 'chapter-1',
      order: 1,
      gameType: GameType.MCQ,
    };

    await useCase.execute(firstCommand);

    const secondCommand: CreateLessonCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Seconde leçon avec le même ordre',
      description: 'Description de la seconde leçon',
      chapterId: 'chapter-1',
      order: 1, // Même ordre que la première leçon
      gameType: GameType.MCQ,
    };

    // When & Then
    await expect(useCase.execute(secondCommand)).rejects.toThrow(
      LessonOrderConflictError,
    );

    const lessons = await lessonRepository.findAll();
    expect(lessons.length).toBe(1); // Seule la première leçon a été créée
  });

  it('should allow creating lessons with the same order in different chapters', async () => {
    // Given
    const firstCommand: CreateLessonCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Leçon du chapitre 1',
      description: 'Description de la leçon',
      chapterId: 'chapter-1',
      order: 1,
      gameType: GameType.MCQ,
    };

    await useCase.execute(firstCommand);

    const secondCommand: CreateLessonCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Leçon du chapitre 2',
      description: 'Description de la leçon',
      chapterId: 'chapter-2', // Chapitre différent
      order: 1, // Même ordre mais dans un chapitre différent
      gameType: GameType.MCQ,
    };

    // When
    const result = await useCase.execute(secondCommand);

    // Then
    expect(result.order).toBe(1);
    expect(result.chapterId).toBe('chapter-2');
    const lessons = await lessonRepository.findAll();
    expect(lessons.length).toBe(2);
  });
});
