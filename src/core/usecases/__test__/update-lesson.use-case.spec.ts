import { LessonRepository } from '../../domain/repository/lesson.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  UpdateLessonCommand,
  UpdateLessonUseCase,
} from '../update-lesson.use-case';
import { GameType } from '../../domain/type/GameType';

describe('UpdateLessonUseCase', () => {
  let lessonRepository: LessonRepository;
  let updateLessonUseCase: UpdateLessonUseCase;

  beforeEach(async () => {
    lessonRepository = new InMemoryLessonRepository();
    updateLessonUseCase = new UpdateLessonUseCase(lessonRepository);

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

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
