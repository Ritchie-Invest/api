import {
  CreateLessonCommand,
  CreateLessonUseCase,
} from '../create-lesson.use-case';
import { UserType } from '../../domain/type/UserType';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { LessonRepository } from '../../domain/repository/lesson.repository';
import { GameType } from '../../domain/type/GameType';

describe('CreateLessonUseCase', () => {
  let useCase: CreateLessonUseCase;
  let lessonRepository: LessonRepository;

  beforeEach(() => {
    lessonRepository = new InMemoryLessonRepository();
    useCase = new CreateLessonUseCase(lessonRepository);
  });

  it('should create a lesson When user is admin', async () => {
    // Given
    const command: CreateLessonCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Lesson 1',
      description: 'Description',
      chapterId: 'chapter-1',
      gameType: GameType.MCQ,
    };

    // When
    const result = await useCase.execute(command);

    // Then
    expect(result.title).toBe(command.title);
    expect(result.description).toBe(command.description);
    expect(result.chapterId).toBe(command.chapterId);
    expect(result.order).toBe(0);
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
      gameType: GameType.MCQ,
    };

    // Then
    await expect(useCase.execute(command)).rejects.toThrow(UserNotAllowedError);
    const lessons = await lessonRepository.findAll();
    expect(lessons.length).toBe(0);
  });

  it('should allow creating lessons with the same order in different chapters', async () => {
    // Given
    const firstCommand: CreateLessonCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Leçon du chapitre 1',
      description: 'Description de la leçon',
      chapterId: 'chapter-1',
      gameType: GameType.MCQ,
    };

    await useCase.execute(firstCommand);

    const secondCommand: CreateLessonCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Leçon du chapitre 2',
      description: 'Description de la leçon',
      chapterId: 'chapter-2',
      gameType: GameType.MCQ,
    };

    // When
    const result = await useCase.execute(secondCommand);

    // Then
    expect(result.order).toBe(0);
    expect(result.chapterId).toBe('chapter-2');
    const lessons = await lessonRepository.findAll();
    expect(lessons.length).toBe(2);
  });
});
