import { ChapterRepository } from '../../domain/repository/chapter.repository';
import { InMemoryChapterRepository } from '../../../adapters/in-memory/in-memory-chapter.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  UpdateChapterCommand,
  UpdateChapterUseCase,
} from '../update-chapter.use-case';
import { OrderValidationInterface } from '../../domain/service/order-validation.service';
import { InMemoryOrderValidationService } from '../../../adapters/in-memory/in-memory-order-validation.service';
import { OrderConflictError } from '../../domain/error/OrderConflictError';

describe('UpdateChapterUseCase', () => {
  let chapterRepository: ChapterRepository;
  let orderValidationService: OrderValidationInterface;
  let updateChapterUseCase: UpdateChapterUseCase;

  beforeEach(async () => {
    chapterRepository = new InMemoryChapterRepository();
    orderValidationService = new InMemoryOrderValidationService();
    updateChapterUseCase = new UpdateChapterUseCase(
      chapterRepository,
      orderValidationService,
    );

    await chapterRepository.removeAll();
    await chapterRepository.create({
      id: 'chapter-id',
      title: 'Un chapitre',
      description: 'Ceci est un chapitre',
      order: 1,
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
      order: 1,
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
      order: 1,
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

  it('should throw an error when trying to update a chapter with an order that already exists', async () => {
    // Given
    await chapterRepository.create({
      id: 'chapter-id-2',
      title: 'Un autre chapitre',
      description: 'Ceci est un autre chapitre',
      order: 2,
    });

    const command: UpdateChapterCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'chapter-id',
      title: 'Un super chapitre modifié',
      description: 'Ceci est un super chapitre modifié',
      order: 2, // Ordre déjà utilisé par chapter-id-2
    };

    // When & Then
    await expect(updateChapterUseCase.execute(command)).rejects.toThrow(
      OrderConflictError,
    );

    // Vérifier que le chapitre n'a pas été modifié
    const chapter = await chapterRepository.findById('chapter-id');
    expect(chapter?.order).toBe(1);
  });

  it('should allow updating a chapter with its own order value', async () => {
    // Given
    const command: UpdateChapterCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'chapter-id',
      title: 'Un super chapitre modifié',
      description: 'Ceci est un super chapitre modifié',
      order: 1, // Même ordre que celui actuel
    };

    // When
    const result = await updateChapterUseCase.execute(command);

    // Then
    expect(result.order).toBe(1);
    expect(result.title).toBe('Un super chapitre modifié');
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
