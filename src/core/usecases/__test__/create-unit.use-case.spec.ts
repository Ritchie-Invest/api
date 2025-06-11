import { CreateUnitUseCase } from '../create-unit';
import { CreateUnitCommand } from '../create-unit';
import { UserType } from '../../domain/type/UserType';
import { UserNotAllowedError } from '../../domain/error/UserNotAllowedError';
import { InMemoryUnitRepository } from '../../../adapters/in-memory/in-memory-unit.repository';

describe('CreateUnitUseCase', () => {
  let useCase: CreateUnitUseCase;
  let unitRepository: InMemoryUnitRepository;

  beforeEach(() => {
    unitRepository = new InMemoryUnitRepository();
    useCase = new CreateUnitUseCase(unitRepository);
  });

  it('should create a unit when user is admin', async () => {
    // GIVEN
    const command: CreateUnitCommand = {
      currentUser: { id: 'admin-id', type: UserType.ADMIN },
      title: 'Unit 1',
      description: 'Description',
      chapterId: 'chapter-1',
    };

    // WHEN
    const result = await useCase.execute(command);

    // THEN
    expect(result.title).toBe(command.title);
    expect(result.description).toBe(command.description);
    expect(result.chapterId).toBe(command.chapterId);
    expect(unitRepository.findAll().length).toBe(1);
  });

  it('should throw UserNotAllowedError if user is not admin', async () => {
    // GIVEN
    const command: CreateUnitCommand = {
      currentUser: { id: 'user-id', type: UserType.STUDENT },
      title: 'Unit 1',
      description: 'Description',
      chapterId: 'chapter-1',
    };

    // THEN
    await expect(useCase.execute(command)).rejects.toThrow(UserNotAllowedError);
    expect(unitRepository.findAll().length).toBe(0);
  });
});
