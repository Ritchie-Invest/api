import { GameModuleStrategy } from './game-module-strategy';
import { MatchChoice } from '../../domain/model/MatchChoice';
import { CreateGameModuleCommand } from '../create-game-module.use-case';
import { MatchModule } from '../../domain/model/MatchModule';
import { MatchModuleInvalidDataError } from '../../domain/error/MatchModuleInvalidDataError';
import { GameModule } from '../../domain/model/GameModule';
import { UpdateGameModuleCommand } from '../update-game-module.use-case';

export class MatchModuleStrategy implements GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): MatchModule {
    if (!command.match || !command.match.instruction || !command.match.matches) {
      throw new MatchModuleInvalidDataError('Match contract is missing');
    }
    return new MatchModule({
      id: crypto.randomUUID(),
      lessonId: command.lessonId,
      instruction: command.match.instruction,
      matches: command.match.matches.map(
        (m) =>
          new MatchChoice({
            id: crypto.randomUUID(),
            value1: m.value1,
            value2: m.value2,
          }),
      ),
    });
  }

  updateModule(
    gameModule: GameModule,
    command: UpdateGameModuleCommand,
  ): GameModule {
    if (!command.match || !command.match.instruction || !command.match.matches) {
      throw new MatchModuleInvalidDataError('Match contract is missing');
    }

    return new MatchModule({
      ...gameModule,
      instruction: command.match.instruction,
      matches: command.match.matches.map(
        (m) =>
          new MatchChoice({
            id: crypto.randomUUID(),
            value1: m.value1,
            value2: m.value2,
          }),
      ),
    });
  }
}
