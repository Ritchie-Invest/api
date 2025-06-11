import { UnitRepository } from '../../domain/repository/unit.repository';
import { InMemoryUnitRepository } from '../../../adapters/in-memory/in-memory-unit.repository';
import { User } from '../../domain/model/User';
import { UserType } from '../../domain/type/UserType';
import { GetUnitByIdUseCase } from '../get-units-by-id.use-case';
import { GetUnitByIdCommand } from '../get-units-by-id.use-case';

describe('GetUnitByIdUseCase', () => {
  let unitRepository: UnitRepository;
  let getUnitByIdUseCase: GetUnitByIdUseCase;

  beforeEach(async () => {
    unitRepository = new InMemoryUnitRepository();
    getUnitByIdUseCase = new GetUnitByIdUseCase(unitRepository);

    await unitRepository.removeAll();
    await unitRepository.create({
      id: 'unit-id',
      title: 'Une super unité',
      description: 'Ceci est une super unité',
    });
  });

  it('should return created unit', async () => {
    // Given
    const command: GetUnitByIdCommand = {
      currentUser: getCurrentUser(),
      unitId: 'unit-id',
    };

    // When
    const unit = await getUnitByIdUseCase.execute(command);

    // Then
    const units = await unitRepository.findAll();
    expect(units.length).toEqual(1);
    expect(unit).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      title: 'Une super unité',
      description: 'Ceci est une super unité',
      isPublished: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(Date),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(Date),
    });
    const storedUnit = units[0];
    expect(storedUnit).toEqual({
      id: unit.id,
      title: 'Une super unité',
      description: 'Ceci est une super unité',
      isPublished: false,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    });
  });

  it('should throw an error if user is not admin', async () => {
    // Given
    const command: GetUnitByIdCommand = {
      currentUser: {
        id: 'user-id',
        type: UserType.STUDENT,
      },
      unitId: 'unit-id',
    };

    // When & Then
    await expect(getUnitByIdUseCase.execute(command)).rejects.toThrow(
      'Unauthorized: Only admins can get units',
    );
  });

  it('should throw an error if unit does not exist', async () => {
    // Given
    const command: GetUnitByIdCommand = {
      currentUser: getCurrentUser(),
      unitId: 'non-existing-unit-id',
    };

    // When & Then
    await expect(getUnitByIdUseCase.execute(command)).rejects.toThrow(
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
