import {
  CreateGameModuleRequest,
  CreateMcqGameModuleContract,
  CreateGaugeGameModuleContract,
  CreateChooseAnOrderGameModuleContract,
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
      case GameType.GAUGE: {
        const contract = request.contract as CreateGaugeGameModuleContract;
        return {
          lessonId,
          gameType: request.gameType,
          gauge: {
            question: contract?.question,
            value: contract?.value,
          },
        };
      }
      case GameType.ORDER: {
        const contract = request.contract as CreateChooseAnOrderGameModuleContract;
        return {
          lessonId,
          gameType: request.gameType,
          chooseAnOrder: {
            question: contract?.question,
            sentences: contract?.sentences?.map(s => ({
              sentence: s.sentence,
              value: s.value,
            })) || [],
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
