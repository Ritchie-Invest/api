import { GameModule } from '../../domain/model/GameModule';
import { GaugeModule } from '../../domain/model/GaugeModule';
import { CreateGameModuleCommand } from '../create-game-module.use-case';
import { UpdateGameModuleCommand } from '../update-game-module.use-case';
import { GameModuleStrategy } from './game-module-strategy';
import { randomUUID } from 'crypto';

export class GaugeGameModuleStrategy implements GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): GameModule {
    if (!command.gauge) {
      throw new Error('Gauge data is required for gauge module');
    }

    return new GaugeModule({
      id: randomUUID(),
      lessonId: command.lessonId,
      question: command.gauge.question,
      value: command.gauge.value,
    });
  }

  updateModule(
    gameModule: GameModule,
    command: UpdateGameModuleCommand,
  ): GameModule {
    if (!(gameModule instanceof GaugeModule)) {
      throw new Error('Game module must be a GaugeModule');
    }
    if (!command.gauge) {
      throw new Error('Gauge data is required for gauge module update');
    }

    return new GaugeModule({
      id: gameModule.id,
      lessonId: gameModule.lessonId,
      question: command.gauge.question,
      value: command.gauge.value,
      createdAt: gameModule.createdAt,
      updatedAt: new Date(),
    });
  }
}
