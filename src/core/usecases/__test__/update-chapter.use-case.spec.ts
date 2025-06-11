import { ChapterRepository } from '../../domain/repository/chapter.repository';
import { InMemoryChapterRepository } from '../../../adapters/in-memory/in-memory-chapter.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  UpdateChapterCommand,
  UpdateChapterUseCase,
} from '../update-chapter.use-case';

describe('UpdateChapterUseCase', () => {
  let chapterRepository: ChapterRepository;
  let updateChapterUseCase: UpdateChapterUseCase;

  beforeEach(async () => {
    chapterRepository = new InMemoryChapterRepository();
    updateChapterUseCase = new UpdateChapterUseCase(chapterRepository);

    await chapterRepository.removeAll();
    await chapterRepository.create({
      id: 'chapter-id',
      title: 'Un chapitre',
      description: 'Ceci est un chapitre',
    });
  });

  it('should return updated chapter', async () => {
    // Given
    const command: UpdateChapterCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'chapter-id',
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
    };

    // When
    const chapter = await updateChapterUseCase.execute(command);

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
    const command: UpdateChapterCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'chapter-id',
      title: '',
      description: 'Ceci est un super chapitre',
    };

    // When & Then
    await expect(updateChapterUseCase.execute(command)).rejects.toThrow(
      'Title is required',
    );
  });

  it('should throw if description is empty', async () => {
    // Given
    const command: UpdateChapterCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'chapter-id',
      title: 'Un super chapitre',
      description: '',
    };

    // When & Then
    await expect(updateChapterUseCase.execute(command)).rejects.toThrow(
      'Description is required',
    );
  });

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: UpdateChapterCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      chapterId: 'chapter-id',
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
    };

    // When & Then
    await expect(updateChapterUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can update chapters',
    );
  });

  it('should throw an error if chapter does not exist', async () => {
    // Given
    const command: UpdateChapterCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'non-existing-chapter-id',
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
    };

    // When & Then
    await expect(updateChapterUseCase.execute(command)).rejects.toThrow(
      'Chapter with id non-existing-chapter-id not found',
    );
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
