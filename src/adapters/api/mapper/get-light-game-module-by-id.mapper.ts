import { GameModule } from '../../../core/domain/model/GameModule';
import { GetGameModuleByIdCommand } from '../../../core/usecases/get-game-module-by-id.use-case';
import { McqModule } from '../../../core/domain/model/McqModule';
import {
  GetLightGameModuleByIdResponse,
  LightGameChoice,
  McqModuleDetails,
} from '../response/get-light-game-module-by-id.response';

export class GetLightGameModuleByIdMapper {
  static toDomain(moduleId: string): GetGameModuleByIdCommand {
    return {
      gameModuleId: moduleId,
    };
  }

  static fromDomain(gameModule: GameModule): GetLightGameModuleByIdResponse {
    if (gameModule instanceof McqModule) {
      return new GetLightGameModuleByIdResponse(
        gameModule.id,
        gameModule.lessonId,
        new McqModuleDetails(
          gameModule.question,
          gameModule.choices.map(
            (choice) => new LightGameChoice(choice.id, choice.text),
          ),
        ),
        gameModule.updatedAt,
        gameModule.createdAt,
      );
    }
    throw new Error('Unsupported module entity');
  }
}
