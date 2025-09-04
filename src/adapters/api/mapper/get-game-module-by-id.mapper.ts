import { GameModule } from '../../../core/domain/model/GameModule';
import { GetGameModuleByIdCommand } from '../../../core/usecases/get-game-module-by-id.use-case';
import {
  GetGameModuleByIdResponse,
  GameChoice,
  McqModuleDetails,
} from '../response/get-game-module-by-id.response';
import { McqModule } from '../../../core/domain/model/McqModule';

export class GetGameModuleByIdMapper {
  static toDomain(moduleId: string): GetGameModuleByIdCommand {
    return {
      gameModuleId: moduleId,
    };
  }

  static fromDomain(gameModule: GameModule): GetGameModuleByIdResponse {
    if (gameModule instanceof McqModule) {
      return new GetGameModuleByIdResponse(
        gameModule.id,
        gameModule.lessonId,
        new McqModuleDetails(
          gameModule.question,
          gameModule.choices.map(
            (choice) =>
              new GameChoice(
                choice.id,
                choice.text,
                choice.isCorrect,
                choice.correctionMessage,
              ),
          ),
        ),
        gameModule.updatedAt,
        gameModule.createdAt,
      );
    }
    throw new Error('Unsupported module entity');
  }
}
