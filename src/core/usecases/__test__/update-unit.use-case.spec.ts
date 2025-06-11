import { UnitRepository } from '../../domain/repository/unit.repository';
import { InMemoryUnitRepository } from '../../../adapters/in-memory/in-memory-unit.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import { UpdateUnitCommand, UpdateUnitUseCase } from '../update-unit.use-case';

describe('UpdateUnitUseCase', () => {
  let unitRepository: UnitRepository;
  let updateUnitUseCase: UpdateUnitUseCase;

  beforeEach(async () => {
    unitRepository = new InMemoryUnitRepository();
    updateUnitUseCase = new UpdateUnitUseCase(unitRepository);

    await unitRepository.removeAll();
    await unitRepository.create({
      id: 'unit-id',
      title: 'Une unité',
      description: 'Ceci est une unité',
      chapterId: 'chapter-1',
    });
  });

  it('should return updated unit', async () => {
    // GIVEN
    const command: UpdateUnitCommand = {
      currentUser: getCurrentUser(),
      unitId: 'unit-id',
      title: 'Une super unité',
      description: 'Ceci est une super unité',
      isPublished: true,
    };

    // WHEN
    const unit = await updateUnitUseCase.execute(command);

    // THEN
    const units = await unitRepository.findAll();
    expect(units.length).toEqual(1);
    expect(unit).toEqual({
      id: 'unit-id',
      title: 'Une super unité',
      description: 'Ceci est une super unité',
      chapterId: 'chapter-1',
      isPublished: true,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    });
    const storedUnit = units[0];
    expect(storedUnit).toEqual({
      id: unit.id,
      title: 'Une super unité',
      description: 'Ceci est une super unité',
      chapterId: 'chapter-1',
      isPublished: true,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    });
  });

  it('should throw if title is empty', async () => {
    // GIVEN
    const command: UpdateUnitCommand = {
      currentUser: getCurrentUser(),
      unitId: 'unit-id',
      title: '',
      description: 'Ceci est une super unité',
      isPublished: true,
    };

    // WHEN & THEN une erreur est levée
    await expect(updateUnitUseCase.execute(command)).rejects.toThrow();
  });

  it('should throw if description is empty', async () => {
    // GIVEN
    const command: UpdateUnitCommand = {
      currentUser: getCurrentUser(),
      unitId: 'unit-id',
      title: 'Une super unité',
      description: '',
      isPublished: true,
    };

    // WHEN & THEN
    await expect(updateUnitUseCase.execute(command)).rejects.toThrow();
  });

  it('should throw an error if user is not admin', async () => {
    // GIVEN
    const command: UpdateUnitCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      unitId: 'unit-id',
      title: 'Une super unité',
      description: 'Ceci est une super unité',
      isPublished: true,
    };

    // WHEN & THEN
    await expect(updateUnitUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can update units',
    );
  });

  it('should throw an error if unit does not exist', async () => {
    // GIVEN
    const command: UpdateUnitCommand = {
      currentUser: getCurrentUser(),
      unitId: 'non-existing-unit-id',
      title: 'Une super unité',
      description: 'Ceci est une super unité',
      isPublished: true,
    };

    // WHEN & THEN
    await expect(updateUnitUseCase.execute(command)).rejects.toThrow(
      'Unit with id non-existing-unit-id not found',
    );
  });

  function getCurrentUser(): Pick<User, 'id' | 'type'> {
    return {
      id: 'admin-id',
      type: UserType.ADMIN,
    };
  }
});
