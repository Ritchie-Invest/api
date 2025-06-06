import { ChapterRepository } from '../../domain/repository/chapter.repository';
import { InMemoryChapterRepository } from '../../../adapters/in-memory/in-memory-chapter.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  GetChapterByIdCommand,
  GetChapterByIdUseCase,
} from '../get-chapter-by-id.use-case';

describe('GetChapterByIdUseCase', () => {
  let chapterRepository: ChapterRepository;
  let getChapterByIdUseCase: GetChapterByIdUseCase;

  beforeEach(async () => {
    chapterRepository = new InMemoryChapterRepository();
    getChapterByIdUseCase = new GetChapterByIdUseCase(chapterRepository);

    await chapterRepository.removeAll();
    await chapterRepository.create({
      id: 'chapter-id',
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
    });
  });

  it('should return created chapter', async () => {
    // Given
    const command: GetChapterByIdCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'chapter-id',
    };

    // When
    const chapter = await getChapterByIdUseCase.execute(command);

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

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: GetChapterByIdCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      chapterId: 'chapter-id',
    };

    // When & Then
    await expect(getChapterByIdUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can get chapters',
    );
  });

  it('should throw an error if chapter does not exist', async () => {
    // Given
    const command: GetChapterByIdCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'non-existing-chapter-id',
    };

    // When & Then
    await expect(getChapterByIdUseCase.execute(command)).rejects.toThrow(
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
