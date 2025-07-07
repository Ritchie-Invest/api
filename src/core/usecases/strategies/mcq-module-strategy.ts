import { GameModuleStrategy } from './game-module-strategy';
import { McqChoice } from '../../domain/model/McqChoice';
import { CreateGameModuleCommand } from '../create-game-module.usecase';
import { McqModule } from '../../domain/model/McqModule';
import { McqModuleInvalidDataError } from '../../domain/error/McqModuleInvalidDataError';

export class McqModuleStrategy implements GameModuleStrategy {
  createModule(command: CreateGameModuleCommand): McqModule {
    if (!command.mcq || !command.mcq.question || !command.mcq.choices) {
      throw new McqModuleInvalidDataError('MCQ contract is missing');
    }
    return new McqModule({
      id: crypto.randomUUID(),
      lessonId: command.lessonId,
      question: command.mcq.question,
      choices: command.mcq.choices.map(
        (c) =>
          new McqChoice({
            id: crypto.randomUUID(),
            text: c.text,
            isCorrect: c.isCorrect,
            correctionMessage: c.correctionMessage,
          }),
      ),
    });
  }
}
