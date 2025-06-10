import { ChapterRepository } from '../../domain/repository/chapter.repository';
import { InMemoryChapterRepository } from '../../../adapters/in-memory/in-memory-chapter.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  GetChaptersCommand,
  GetChaptersUseCase,
} from '../get-chapters.use-case';

describe('GetChaptersUseCase', () => {
  let chapterRepository: ChapterRepository;
  let getChaptersUseCase: GetChaptersUseCase;

  beforeEach(async () => {
    chapterRepository = new InMemoryChapterRepository();
    getChaptersUseCase = new GetChaptersUseCase(chapterRepository);

    await chapterRepository.removeAll();
    await chapterRepository.create({
      id: 'chapter-id',
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
    });
    await chapterRepository.create({
      id: 'another-chapter-id',
      title: 'Un autre super chapitre',
      description: 'Ceci est un autre super chapitre',
    });
  });

  it('should return created chapter', async () => {
    // Given
    const command: GetChaptersCommand = {
      currentUser: getCurrentUser(),
    };

    // When
    const chapters = await getChaptersUseCase.execute(command);

    // Then
    const storedChapters = await chapterRepository.findAll();
    expect(chapters.length).toEqual(2);
    expect(chapters[0]).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
      is_published: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(Date),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(Date),
    });
    expect(chapters[1]).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      title: 'Un autre super chapitre',
      description: 'Ceci est un autre super chapitre',
      is_published: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(Date),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(Date),
    });
    expect(storedChapters[0]).toEqual({
      id: chapters[0]?.id,
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
      is_published: false,
      createdAt: chapters[0]?.createdAt,
      updatedAt: chapters[0]?.updatedAt,
    });
    expect(storedChapters[1]).toEqual({
      id: chapters[1]?.id,
      title: 'Un autre super chapitre',
      description: 'Ceci est un autre super chapitre',
      is_published: false,
      createdAt: chapters[1]?.createdAt,
      updatedAt: chapters[1]?.updatedAt,
    });
  });

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: GetChaptersCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
    };

    // When & Then
    await expect(getChaptersUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can get chapters',
    );
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
