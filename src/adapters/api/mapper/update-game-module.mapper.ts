import { GameType } from '../../../core/domain/type/GameType';
import { CreateLessonResponse } from '../response/create-lesson.response';
import { Lesson } from '../../../core/domain/model/Lesson';
import {
  UpdateGameModuleRequest,
  UpdateMcqGameModuleContract,
  UpdateFillInTheBlankGameModuleContract,
  UpdateTrueOrFalseGameModuleContract,
} from '../request/update-game-module.request';
import { UpdateGameModuleCommand } from '../../../core/usecases/update-game-module.use-case';

export class UpdateGameModuleMapper {
  static toDomain(
    gameModuleId: string,
    request: UpdateGameModuleRequest,
  ): UpdateGameModuleCommand {
    switch (request.gameType) {
      case GameType.MCQ: {
        const contract = request.contract as UpdateMcqGameModuleContract;
        return {
          gameModuleId,
          mcq: {
            question: contract?.question,
            choices: contract?.choices,
          },
        };
      }
      case GameType.FILL_IN_THE_BLANK: {
        const contract =
          request.contract as UpdateFillInTheBlankGameModuleContract;
        return {
          gameModuleId,
          fillInTheBlank: {
            firstText: contract?.firstText,
            secondText: contract?.secondText,
            blanks: contract?.blanks,
          },
        };
      }
      case GameType.TRUE_OR_FALSE: {
        const contract =
          request.contract as UpdateTrueOrFalseGameModuleContract;
        return {
          gameModuleId,
          trueOrFalse: {
            sentence: contract?.sentence,
            isTrue: contract?.isTrue,
          },
        };
      }
      default:
        throw new Error('Game type not supported');
    }
  }

  static fromDomain(lesson: Lesson): CreateLessonResponse {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      chapterId: lesson.chapterId,
      order: lesson.order !== undefined ? lesson.order : 0,
      isPublished: lesson.isPublished,
      modules: lesson.modules,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}
