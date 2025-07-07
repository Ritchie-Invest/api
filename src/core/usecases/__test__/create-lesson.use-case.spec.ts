import { CreateLessonCommand, CreateLessonUseCase } from '../create-lesson';
import { UserType } from '../../domain/type/UserType';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { GameType } from '../../domain/type/GameType';

describe('CreateLessonUseCase', () => {
  let useCase: CreateLessonUseCase;
  let lessonRepository: InMemoryLessonRepository;

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
    expect(lessonRepository.findAll().length).toBe(1);
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
    expect(lessonRepository.findAll().length).toBe(0);
  });
});
