import { CreateUnitUseCase } from '../create-unit';
import { CreateUnitCommand } from '../create-unit';
import { UnitRepository } from '../../domain/repository/unit.repository';
import { UserType } from '../../domain/type/UserType';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import {Unit} from '../../domain/model/Unit';

describe('CreateUnitUseCase', () => {
  let useCase: CreateUnitUseCase;
  let unitRepository: jest.Mocked<UnitRepository>;

  beforeEach(() => {
    unitRepository = {
      create: jest.fn(),
    } as any;
    useCase = new CreateUnitUseCase(unitRepository);
  });

  it('should create a unit when user is admin', async () => {
    const command: CreateUnitCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Unit 1',
      description: 'Description',
      chapterId: 'chapter-1',
    };
    unitRepository.create.mockImplementation(async (data: Partial<Unit>) => {
      return {
        id: 'unit-id',
        title: data.title ?? '',
        description: data.description ?? '',
        chapterId: data.chapterId ?? '',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      } as Unit;
    });

    const result = await useCase.execute(command);

    expect(result.title).toBe(command.title);
    expect(result.description).toBe(command.description);
    expect(result.chapterId).toBe(command.chapterId);
    expect(unitRepository.create).toHaveBeenCalledWith(expect.any(Unit));
  });

  it('should throw UserNotAllowedError if user is not admin', async () => {
    const command: CreateUnitCommand = {
      currentUser: { id: 'user-id', type: UserType.STUDENT },
      title: 'Unit 1',
      description: 'Description',
      chapterId: 'chapter-1',
    };

    await expect(useCase.execute(command)).rejects.toThrow(UserNotAllowedError);
    expect(unitRepository.create).not.toHaveBeenCalled();
  });
});