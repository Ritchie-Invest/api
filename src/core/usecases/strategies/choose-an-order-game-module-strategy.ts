import { GameModule } from '../../domain/model/GameModule';
import { ChooseAnOrderModule } from '../../domain/model/ChooseAnOrderModule';
import { ChooseAnOrderChoice } from '../../domain/model/ChooseAnOrderChoice';
import { CreateGameModuleCommand } from '../create-game-module.use-case';
import { UpdateGameModuleCommand } from '../update-game-module.use-case';
import { GameModuleStrategy } from './game-module-strategy';
import { randomUUID } from 'crypto';

export class ChooseAnOrderGameModuleStrategy implements GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): GameModule {
    if (!command.chooseAnOrder) {
      throw new Error('ChooseAnOrder data is required for choose an order module');
    }

    const sentences = command.chooseAnOrder.sentences.map(
      (sentence) => new ChooseAnOrderChoice({
        sentence: sentence.sentence,
        value: sentence.value,
      })
    );

    return new ChooseAnOrderModule({
      id: randomUUID(),
      lessonId: command.lessonId,
      question: command.chooseAnOrder.question,
      sentences,
    });
  }

  updateModule(
    gameModule: GameModule,
    command: UpdateGameModuleCommand,
  ): GameModule {
    if (!(gameModule instanceof ChooseAnOrderModule)) {
      throw new Error('Game module must be a ChooseAnOrderModule');
    }
    if (!command.chooseAnOrder) {
      throw new Error('ChooseAnOrder data is required for choose an order module update');
    }

    const sentences = command.chooseAnOrder.sentences.map(
      (sentence) => new ChooseAnOrderChoice({
        sentence: sentence.sentence,
        value: sentence.value,
      })
    );

    return new ChooseAnOrderModule({
      id: gameModule.id,
      lessonId: gameModule.lessonId,
      question: command.chooseAnOrder.question,
      sentences,
      createdAt: gameModule.createdAt,
      updatedAt: new Date(),
    });
  }
}
