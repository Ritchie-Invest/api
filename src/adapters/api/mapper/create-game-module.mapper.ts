import {
  CreateGameModuleRequest,
  CreateMcqGameModuleContract,
  CreateFillInTheBlankGameModuleContract,
  CreateTrueOrFalseGameModuleContract,
} from '../request/create-game-module.request';
import { CreateGameModuleCommand } from '../../../core/usecases/create-game-module.use-case';
import { GameType } from '../../../core/domain/type/GameType';
import { CreateLessonResponse } from '../response/create-lesson.response';
import { Lesson } from '../../../core/domain/model/Lesson';

export class CreateGameModuleMapper {
  static toDomain(
    lessonId: string,
    request: CreateGameModuleRequest,
  ): CreateGameModuleCommand {
    switch (request.gameType) {
      case GameType.MCQ: {
        const contract = request.contract as CreateMcqGameModuleContract;
        return {
          lessonId,
          gameType: request.gameType,
          mcq: {
            question: contract?.question,
            choices: contract?.choices,
          },
        };
      }
      case GameType.FILL_IN_THE_BLANK: {
        const contract =
          request.contract as CreateFillInTheBlankGameModuleContract;
        return {
          lessonId,
          gameType: request.gameType,
          fillInTheBlank: {
            firstText: contract?.firstText,
            secondText: contract?.secondText,
            blanks: contract?.blanks,
          },
        };
      }
      case GameType.TRUE_OR_FALSE: {
        const contract =
          request.contract as CreateTrueOrFalseGameModuleContract;
        return {
          lessonId,
          gameType: request.gameType,
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
      gameType: lesson.gameType,
      modules: lesson.modules,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}
