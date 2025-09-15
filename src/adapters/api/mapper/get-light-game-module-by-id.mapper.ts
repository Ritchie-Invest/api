import { GameModule } from '../../../core/domain/model/GameModule';
import { GetGameModuleByIdCommand } from '../../../core/usecases/get-game-module-by-id.use-case';
import { McqModule } from '../../../core/domain/model/McqModule';
import { TrueOrFalseModule } from '../../../core/domain/model/TrueOrFalseModule';
import {
  GetLightGameModuleByIdResponse,
  LightFillInTheBlankChoice,
  LightFillInTheBlankModuleDetails,
  LightMcqChoice,
  LightMcqModuleDetails,
  LightTrueOrFalseModuleDetails,
} from '../response/get-light-game-module-by-id.response';
import { FillInTheBlankModule } from '../../../core/domain/model/FillInTheBlankModule';

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
        new LightMcqModuleDetails(
          gameModule.question,
          gameModule.choices.map(
            (choice) =>
              new LightMcqChoice(choice.id, choice.text, choice.isCorrect),
          ),
        ),
        gameModule.updatedAt,
        gameModule.createdAt,
      );
    }
    if (gameModule instanceof FillInTheBlankModule)
      return new GetLightGameModuleByIdResponse(
        gameModule.id,
        gameModule.lessonId,
        new LightFillInTheBlankModuleDetails(
          gameModule.firstText,
          gameModule.secondText,
          gameModule.blanks.map(
            (blank) =>
              new LightFillInTheBlankChoice(
                blank.id,
                blank.text,
                blank.isCorrect,
              ),
          ),
        ),
        gameModule.updatedAt,
        gameModule.createdAt,
      );
    if (gameModule instanceof TrueOrFalseModule) {
      return new GetLightGameModuleByIdResponse(
        gameModule.id,
        gameModule.lessonId,
        new LightTrueOrFalseModuleDetails(
          gameModule.sentence,
          gameModule.isTrue,
        ),
        gameModule.updatedAt,
        gameModule.createdAt,
      );
    }

    throw new Error('Unsupported module entity');
  }
}
