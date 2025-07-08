import { LessonRepository } from '../../domain/repository/lesson.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';

import { OrderValidationInterface } from '../../domain/service/order-validation.service';
import { InMemoryOrderValidationService } from '../../../adapters/in-memory/in-memory-order-validation.service';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  UpdateLessonCommand,
  UpdateLessonUseCase,
} from '../update-lesson.use-case';
import { GameType } from '../../domain/type/GameType';
import { OrderConflictError } from '../../domain/error/OrderConflictError';

describe('UpdateLessonUseCase', () => {
  let lessonRepository: LessonRepository;
  let OrderValidation: OrderValidationInterface;
  let updateLessonUseCase: UpdateLessonUseCase;

  beforeEach(async () => {
    lessonRepository = new InMemoryLessonRepository();
    OrderValidation = new InMemoryOrderValidationService();
    updateLessonUseCase = new UpdateLessonUseCase(
      lessonRepository,
      OrderValidation,
    );

    await lessonRepository.removeAll();
    await lessonRepository.create({
      id: 'lesson-id',
      title: 'Une leçon',
      description: 'Ceci est une leçon',
      chapterId: 'chapter-1',
      order: 1,
    });
  });

  it('should return updated lesson', async () => {
    // Given
    const command: UpdateLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
      title: 'Une super leçon',
      description: 'Ceci est une super leçon',
      isPublished: true,
      order: 2,
    };

    // When
    const lesson = await updateLessonUseCase.execute(command);

    // Then
    const lessons = await lessonRepository.findAll();
    expect(lessons.length).toEqual(1);
    expect(lesson).toEqual({
      id: 'lesson-id',
      title: 'Une super leçon',
      description: 'Ceci est une super leçon',
      chapterId: 'chapter-1',
      isPublished: true,
      order: 2,
      gameType: GameType.MCQ,
      modules: [],
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    });
    const storedLesson = lessons[0];
    expect(storedLesson).toEqual({
      id: lesson.id,
      title: 'Une super leçon',
      description: 'Ceci est une super leçon',
      chapterId: 'chapter-1',
      isPublished: true,
      order: 2,
      gameType: GameType.MCQ,
      modules: [],
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    });
  });

  it('should throw if title is empty', async () => {
    // Given
    const command: UpdateLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
      title: '',
      description: 'Ceci est une super leçon',
      isPublished: true,
      order: 3,
    };

    // When & Then
    await expect(updateLessonUseCase.execute(command)).rejects.toThrow();
  });

  it('should throw if description is empty', async () => {
    // Given
    const command: UpdateLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
      title: 'Une super leçon',
      description: '',
      isPublished: true,
      order: 4,
    };

    // When & Then
    await expect(updateLessonUseCase.execute(command)).rejects.toThrow();
  });

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: UpdateLessonCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      lessonId: 'lesson-id',
      title: 'Une super leçon',
      description: 'Ceci est une super leçon',
      order: 5,
      isPublished: true,
    };

    // When & Then
    await expect(updateLessonUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can update lessons',
    );
  });

  it('should throw an error if lesson does not exist', async () => {
    // Given
    const command: UpdateLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'non-existing-lesson-id',
      title: 'Une super leçon',
      description: 'Ceci est une super leçon',
      order: 6,
      isPublished: true,
    };

    // When & Then
    await expect(updateLessonUseCase.execute(command)).rejects.toThrow(
      'Lesson with id non-existing-lesson-id not found',
    );
  });

  it('should throw an error when trying to update a lesson with an order that already exists in the same chapter', async () => {
    // Given
    await lessonRepository.create({
      id: 'lesson-id-2',
      title: 'Une autre leçon',
      description: 'Ceci est une autre leçon',
      chapterId: 'chapter-1',
      order: 2,
    });

    const command: UpdateLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
      title: 'Une super leçon modifiée',
      description: 'Ceci est une super leçon modifiée',
      order: 2, // Ordre déjà utilisé par lesson-id-2 dans le même chapitre
      isPublished: true,
    };

    // When & Then
    await expect(updateLessonUseCase.execute(command)).rejects.toThrow(
      OrderConflictError,
    );

    // Vérifier que la leçon n'a pas été modifiée
    const lesson = await lessonRepository.findById('lesson-id');
    expect(lesson?.order).toBe(1);
  });

  it('should allow updating a lesson with its own order value', async () => {
    // Given
    const command: UpdateLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
      title: 'Une super leçon modifiée',
      description: 'Ceci est une super leçon modifiée',
      order: 1, // Même ordre que celui actuel
      isPublished: true,
    };

    // When
    const result = await updateLessonUseCase.execute(command);

    // Then
    expect(result.order).toBe(1);
    expect(result.title).toBe('Une super leçon modifiée');
  });

  it('should allow updating a lesson to a new order that does not conflict in the same chapter', async () => {
    // Given
    const command: UpdateLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
      title: 'Une super leçon modifiée',
      description: 'Ceci est une super leçon modifiée',
      order: 3, // Nouvel ordre qui n'existe pas encore
      isPublished: true,
    };

    // When
    const result = await updateLessonUseCase.execute(command);

    // Then
    expect(result.order).toBe(3);
  });

  it('should allow updating lessons with the same order in different chapters', async () => {
    // Given
    await lessonRepository.create({
      id: 'lesson-id-3',
      title: 'Une leçon dans un autre chapitre',
      description: 'Ceci est une leçon dans un autre chapitre',
      chapterId: 'chapter-2',
      order: 5,
    });

    const command: UpdateLessonCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
      title: 'Une super leçon modifiée',
      description: 'Ceci est une super leçon modifiée',
      order: 5, // Même ordre que lesson-id-3 mais dans un chapitre différent
      isPublished: true,
    };

    // When
    const result = await updateLessonUseCase.execute(command);

    // Then
    expect(result.order).toBe(5);
    expect(result.chapterId).toBe('chapter-1');
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
