import { LessonRepository } from '../../domain/repository/lesson.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import { GetLessonByIdUseCase } from '../get-lesson-by-id.use-case';
import { GetLessonByIdCommand } from '../get-lesson-by-id.use-case';

describe('GetLessonByIdUseCase', () => {
  let lessonRepository: LessonRepository;
  let getLessonByIdUseCase: GetLessonByIdUseCase;

  beforeEach(async () => {
    lessonRepository = new InMemoryLessonRepository();
    getLessonByIdUseCase = new GetLessonByIdUseCase(lessonRepository);

    await lessonRepository.removeAll();
    await lessonRepository.create({
      id: 'lesson-id',
      title: 'Une super leçon',
      description: 'Ceci est une super leçon',
      chapterId: 'chapter-id',
      order: 1,
    });
  });

  it('should return created lesson', async () => {
    // Given
    const command: GetLessonByIdCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'lesson-id',
    };

    // When
    const lesson = await getLessonByIdUseCase.execute(command);

    // Then
    const lessons = await lessonRepository.findAll();
    expect(lessons.length).toEqual(1);
    expect(lesson).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      title: 'Une super leçon',
      description: 'Ceci est une super leçon',
      chapterId: 'chapter-id',
      order: 1,
      isPublished: false,
      modules: [],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(Date),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(Date),
    });
    const storedLesson = lessons[0];
    expect(storedLesson).toEqual({
      id: lesson.id,
      title: 'Une super leçon',
      description: 'Ceci est une super leçon',
      chapterId: 'chapter-id',
      order: 1,
      isPublished: false,
      modules: [],
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    });
  });

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: GetLessonByIdCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      lessonId: 'lesson-id',
    };

    // When & Then
    await expect(getLessonByIdUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can get lessons',
    );
  });

  it('should throw an error if lesson does not exist', async () => {
    // Given
    const command: GetLessonByIdCommand = {
      currentUser: getCurrentUser(),
      lessonId: 'non-existing-lesson-id',
    };

    // When & Then
    await expect(getLessonByIdUseCase.execute(command)).rejects.toThrow(
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
