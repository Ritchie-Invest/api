import {
  CreateGameModuleRequest,
  McqGameModuleContract,
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
        const contract = request.contract as McqGameModuleContract;
        return {
          lessonId,
          gameType: request.gameType,
          mcq: {
            question: contract?.question,
            choices: contract?.choices,
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
