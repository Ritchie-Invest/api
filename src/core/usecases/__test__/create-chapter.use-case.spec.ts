import {
  CreateChapterCommand,
  CreateChapterUseCase,
} from '../create-chapter.use-case';
import { ChapterRepository } from '../../domain/repository/chapter.repository';
import { InMemoryChapterRepository } from '../../../adapters/in-memory/in-memory-chapter.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';

describe('CreateChapterUseCase', () => {
  let chapterRepository: ChapterRepository;
  let createChapterUseCase: CreateChapterUseCase;

  beforeEach(() => {
    chapterRepository = new InMemoryChapterRepository();
    createChapterUseCase = new CreateChapterUseCase(chapterRepository);
  });

  it('should return created chapter', async () => {
    // Given
    const command: CreateChapterCommand = {
      currentUser: getCurrentUser(),
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
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
    };

    // When & Then
    await expect(createChapterUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can create chapters',
    );
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
