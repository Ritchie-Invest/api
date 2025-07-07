import { LessonRepository } from '../../domain/repository/lesson.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  GetLessonsByChapterIdCommand,
  GetLessonsByChapterIdUseCase,
} from '../get-lessons-by-chapter.use-case';

describe('GetLessonsByChapterIdUseCase', () => {
  let lessonRepository: LessonRepository;
  let getLessonsUseCase: GetLessonsByChapterIdUseCase;

  beforeEach(async () => {
    lessonRepository = new InMemoryLessonRepository();
    getLessonsUseCase = new GetLessonsByChapterIdUseCase(lessonRepository);

    await lessonRepository.removeAll();
    await lessonRepository.create({
      id: 'lesson-id',
      title: 'une super leçon',
      description: 'Ceci est une super leçon',
      chapterId: 'some-chapter-id',
      order: 1,
    });
    await lessonRepository.create({
      id: 'another-lesson-id',
      title: 'Une autre super leçon',
      description: 'Ceci est une autre super leçon',
      chapterId: 'some-chapter-id',
      order: 2,
    });
    await lessonRepository.create({
      id: 'third-lesson-id',
      title: 'Leçon différente',
      description: 'Ceci est une leçon différente',
      chapterId: 'other-chapter-id',
      order: 3,
    });
  });

  it('should return created lesson', async () => {
    // Given
    const command: GetLessonsByChapterIdCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'some-chapter-id',
    };

    // When
    const lessons = await getLessonsUseCase.execute(command);

    // Then
    const storedLessons = await lessonRepository.findAll();
    expect(lessons.length).toBe(2);

    expect(lessons[0]).toMatchObject({
      title: 'une super leçon',
      description: 'Ceci est une super leçon',
      chapterId: 'some-chapter-id',
      isPublished: false,
      order: 1,
    });
    expect(typeof lessons[0]?.id).toBe('string');
    expect(lessons[0]?.createdAt).toBeInstanceOf(Date);
    expect(lessons[0]?.updatedAt).toBeInstanceOf(Date);

    expect(lessons[1]).toMatchObject({
      title: 'Une autre super leçon',
      description: 'Ceci est une autre super leçon',
      chapterId: 'some-chapter-id',
      isPublished: false,
      order: 2,
    });
    expect(typeof lessons[1]?.id).toBe('string');
    expect(lessons[1]?.createdAt).toBeInstanceOf(Date);
    expect(lessons[1]?.updatedAt).toBeInstanceOf(Date);

    expect(storedLessons[0]).toMatchObject({
      id: lessons[0]?.id,
      title: 'une super leçon',
      description: 'Ceci est une super leçon',
      chapterId: 'some-chapter-id',
      isPublished: false,
      order: 1,
      createdAt: lessons[0]?.createdAt,
      updatedAt: lessons[0]?.updatedAt,
    });
    expect(storedLessons[1]).toMatchObject({
      id: lessons[1]?.id,
      title: 'Une autre super leçon',
      description: 'Ceci est une autre super leçon',
      chapterId: 'some-chapter-id',
      isPublished: false,
      order: 2,
      createdAt: lessons[1]?.createdAt,
      updatedAt: lessons[1]?.updatedAt,
    });
  });

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: GetLessonsByChapterIdCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      chapterId: 'some-chapter-id',
    };

    // When / Then
    await expect(getLessonsUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can get lessons',
    );
  });

  it('should return empty array if no lessons for chapter', async () => {
    // Given
    const command: GetLessonsByChapterIdCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'non-existent-chapter',
    };

    // When
    const lessons = await getLessonsUseCase.execute(command);

    // Then
    expect(lessons).toMatchObject([]);
  });

  it('should only return lessons for the specified chapter', async () => {
    // Given
    const command: GetLessonsByChapterIdCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'other-chapter-id',
    };

    // When
    const lessons = await getLessonsUseCase.execute(command);

    // Then
    expect(lessons.length).toBe(1);
    expect(lessons[0]?.title).toBe('Leçon différente');
    expect(lessons[0]?.chapterId).toBe('other-chapter-id');
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
