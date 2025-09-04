import {
  CreateChapterCommand,
  CreateChapterUseCase,
} from '../create-chapter.use-case';
import { ChapterRepository } from '../../domain/repository/chapter.repository';
import { InMemoryChapterRepository } from '../../../adapters/in-memory/in-memory-chapter.repository';
import { InMemoryLessonRepository } from '../../../adapters/in-memory/in-memory-lesson.repository';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import { ChapterOrderConflictError } from '../../domain/error/ChapterOrderConflictError';
import { InMemoryLessonCompletionRepository } from '../../../adapters/in-memory/in-memory-lesson-completion.repository';

describe('CreateChapterUseCase', () => {
  let chapterRepository: ChapterRepository;
  let createChapterUseCase: CreateChapterUseCase;

  beforeEach(() => {
    const lessonRepository = new InMemoryLessonRepository();
    const gameModuleRepository = new InMemoryGameModuleRepository();
    const lessonCompletionRepository = new InMemoryLessonCompletionRepository();
    chapterRepository = new InMemoryChapterRepository(
      lessonRepository,
      gameModuleRepository,
      lessonCompletionRepository,
    );
    createChapterUseCase = new CreateChapterUseCase(chapterRepository);
  });

  it('should return created chapter', async () => {
    // Given
    const command: CreateChapterCommand = {
      currentUser: getCurrentUser(),
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
      order: 0,
    };

    // When
    const chapter = await createChapterUseCase.execute(command);

    // Then
    const chapters = await chapterRepository.findAll();
    expect(chapters.length).toEqual(1);
    expect(chapter).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
      order: 0,
      isPublished: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(Date),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(Date),
    });
    const storedChapter = chapters[0];
    expect(storedChapter).toEqual({
      id: chapter.id,
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
      order: 0,
      isPublished: false,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    });
  });

  it('should throw if title is empty', async () => {
    // Given
    const command: CreateChapterCommand = {
      currentUser: getCurrentUser(),
      title: '',
      description: 'Ceci est un super chapitre',
      order: 0,
    };

    // When & Then
    await expect(createChapterUseCase.execute(command)).rejects.toThrow(
      'Title is required',
    );
  });

  it('should throw if description is empty', async () => {
    // Given
    const command: CreateChapterCommand = {
      currentUser: getCurrentUser(),
      title: 'Un super chapitre',
      description: '',
      order: 0,
    };

    // When & Then
    await expect(createChapterUseCase.execute(command)).rejects.toThrow(
      'Description is required',
    );
  });

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: CreateChapterCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
      order: 0,
    };

    // When & Then
    await expect(createChapterUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can create chapters',
    );
  });

  it('should throw an error if a chapter with the same order already exists', async () => {
    // Given
    const firstCommand: CreateChapterCommand = {
      currentUser: getCurrentUser(),
      title: 'Premier chapitre',
      description: 'Description du premier chapitre',
      order: 1,
    };

    await createChapterUseCase.execute(firstCommand);

    const secondCommand: CreateChapterCommand = {
      currentUser: getCurrentUser(),
      title: 'Second chapitre avec le même ordre',
      description: 'Description du second chapitre',
      order: 1,
    };

    // When & Then
    await expect(createChapterUseCase.execute(secondCommand)).rejects.toThrow(
      ChapterOrderConflictError,
    );

    const chapters = await chapterRepository.findAll();
    expect(chapters.length).toBe(1);
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
