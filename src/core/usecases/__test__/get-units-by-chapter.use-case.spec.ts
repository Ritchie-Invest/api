import { UnitRepository } from '../../domain/repository/unit.repository';
import { InMemoryUnitRepository } from '../../../adapters/in-memory/in-memory-unit.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import {
  getUnitsByChapterIdUseCase,
  getUnitsByChapterIdCommand,
} from '../get-units-by-chapter.use-case';

describe('getUnitsByChapterIdUseCase', () => {
  let unitRepository: UnitRepository;
  let getUnitsUseCase: getUnitsByChapterIdUseCase;

  beforeEach(async () => {
    unitRepository = new InMemoryUnitRepository();
    getUnitsUseCase = new getUnitsByChapterIdUseCase(unitRepository);

    await unitRepository.removeAll();
    await unitRepository.create({
      id: 'unit-id',
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
      chapterId: 'some-chapter-id',
    });
    await unitRepository.create({
      id: 'another-unit-id',
      title: 'Un autre super chapitre',
      description: 'Ceci est un autre super chapitre',
      chapterId: 'some-chapter-id',
    });
    await unitRepository.create({
      id: 'third-unit-id',
      title: 'Chapitre différent',
      description: 'Ceci est un chapitre différent',
      chapterId: 'other-chapter-id',
    });
  });

  it('should return created unit', async () => {
    // Given
    const command: getUnitsByChapterIdCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'some-chapter-id',
    };

    // When
    const units = await getUnitsUseCase.execute(command);

    // Then
    const storedUnits = await unitRepository.findAll();
    expect(units.length).toBe(2);

    expect(units[0]).toMatchObject({
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
      chapterId: 'some-chapter-id',
      isPublished: false,
    });
    expect(typeof units[0]?.id).toBe('string');
    expect(units[0]?.createdAt).toBeInstanceOf(Date);
    expect(units[0]?.updatedAt).toBeInstanceOf(Date);

    expect(units[1]).toMatchObject({
      title: 'Un autre super chapitre',
      description: 'Ceci est un autre super chapitre',
      chapterId: 'some-chapter-id',
      isPublished: false,
    });
    expect(typeof units[1]?.id).toBe('string');
    expect(units[1]?.createdAt).toBeInstanceOf(Date);
    expect(units[1]?.updatedAt).toBeInstanceOf(Date);

    expect(storedUnits[0]).toMatchObject({
      id: units[0]?.id,
      title: 'Un super chapitre',
      description: 'Ceci est un super chapitre',
      chapterId: 'some-chapter-id',
      isPublished: false,
      createdAt: units[0]?.createdAt,
      updatedAt: units[0]?.updatedAt,
    });
    expect(storedUnits[1]).toMatchObject({
      id: units[1]?.id,
      title: 'Un autre super chapitre',
      description: 'Ceci est un autre super chapitre',
      chapterId: 'some-chapter-id',
      isPublished: false,
      createdAt: units[1]?.createdAt,
      updatedAt: units[1]?.updatedAt,
    });
  });

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: getUnitsByChapterIdCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      chapterId: 'some-chapter-id',
    };

    // When / Then
    await expect(getUnitsUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can get units',
    );
  });

  it('should return empty array if no units for chapter', async () => {
    // Given
    const command: getUnitsByChapterIdCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'non-existent-chapter',
    };

    // When
    const units = await getUnitsUseCase.execute(command);

    // Then
    expect(units).toMatchObject([]);
  });

  it('should only return units for the specified chapter', async () => {
    // Given
    const command: getUnitsByChapterIdCommand = {
      currentUser: getCurrentUser(),
      chapterId: 'other-chapter-id',
    };

    // When
    const units = await getUnitsUseCase.execute(command);

    // Then
    expect(units.length).toBe(1);
    expect(units[0]?.title).toBe('Chapitre différent');
    expect(units[0]?.chapterId).toBe('other-chapter-id');
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
