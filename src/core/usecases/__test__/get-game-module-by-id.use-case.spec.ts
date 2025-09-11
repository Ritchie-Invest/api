import { GameModuleRepository } from '../../domain/repository/game-module.repository';
import {
  GetGameModuleByIdCommand,
  GetGameModuleByIdUseCase,
} from '../get-game-module-by-id.use-case';
import { InMemoryGameModuleRepository } from '../../../adapters/in-memory/in-memory-game-module.repository';
import { McqModule } from '../../domain/model/McqModule';
import { GameType } from '../../domain/type/GameType';

describe('GetGameModuleByIdUseCase', () => {
  let gameModuleRepository: GameModuleRepository;
  let getGameModuleByIdUseCase: GetGameModuleByIdUseCase;

  beforeEach(async () => {
    gameModuleRepository = new InMemoryGameModuleRepository();
    getGameModuleByIdUseCase = new GetGameModuleByIdUseCase(
      gameModuleRepository,
    );

    await gameModuleRepository.removeAll();
  });

  it('should return MCQ game module', async () => {
    // Given
    const mcqModule = new McqModule({
      id: 'mcq-module-id',
      lessonId: 'lesson-id',
      question: 'Quelle est la capitale de la France ?',
      choices: [
        {
          id: 'choice-1',
          text: 'Paris',
          isCorrect: true,
          correctionMessage: 'Correct ! Paris est la capitale de la France.',
        },
        {
          id: 'choice-2',
          text: 'Londres',
          isCorrect: false,
          correctionMessage: 'Incorrect ! La capitale de la France est Paris.',
        },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    await gameModuleRepository.create(mcqModule);
    const command: GetGameModuleByIdCommand = {
      gameModuleId: 'mcq-module-id',
    };

    // When
    const returnedMcqModule = await getGameModuleByIdUseCase.execute(command);

    // Then
    expect(returnedMcqModule).toEqual({
      id: 'mcq-module-id',
      lessonId: 'lesson-id',
      gameType: GameType.MCQ,
      question: 'Quelle est la capitale de la France ?',
      choices: [
        {
          id: 'choice-1',
          text: 'Paris',
          isCorrect: true,
          correctionMessage: 'Correct ! Paris est la capitale de la France.',
        },
        {
          id: 'choice-2',
          text: 'Londres',
          isCorrect: false,
          correctionMessage: 'Incorrect ! La capitale de la France est Paris.',
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(Date),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(Date),
    });
  });

  it('should throw an error if game module does not exist', async () => {
    // Given
    const command: GetGameModuleByIdCommand = {
      gameModuleId: 'non-existing-module-id',
    };

    // When & Then
    await expect(getGameModuleByIdUseCase.execute(command)).rejects.toThrow(
      'Game module with id non-existing-module-id not found',
    );
  });
});
