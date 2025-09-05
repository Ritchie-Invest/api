import {
  CompleteGameModuleCommand,
  CompleteGameModuleResult,
} from '../../../core/usecases/complete-game-module.use-case';
import { CompleteGameModuleRequest } from '../request/complete-game-module.request';
import { CompleteGameModuleResponse } from '../response/complete-game-module.response';

export class CompleteGameModuleMapper {
  static toDomain(
    userId: string,
    moduleId: string,
    request: CompleteGameModuleRequest,
  ): CompleteGameModuleCommand {
    return {
      userId,
      moduleId,
      gameType: request.gameType,
      mcq: request.mcq
        ? {
            choiceId: request.mcq.choiceId,
          }
        : undefined,
      fillInTheBlank: request.fillInTheBlank
        ? {
            blankId: request.fillInTheBlank.blankId,
          }
        : undefined,
      trueOrFalse: request.trueOrFalse
        ? {
            questionId: request.trueOrFalse.questionId,
            answer: request.trueOrFalse.answer,
          }
        : undefined,
    };
  }

  static fromDomain(
    result: CompleteGameModuleResult,
  ): CompleteGameModuleResponse {
    return new CompleteGameModuleResponse(
      result.isCorrect,
      result.feedback,
      result.correctChoiceId,
      result.nextGameModuleId,
      result.currentGameModuleIndex,
      result.totalGameModules,
    );
  }
}
