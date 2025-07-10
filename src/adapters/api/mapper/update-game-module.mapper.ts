import { GameType } from '../../../core/domain/type/GameType';
import { CreateLessonResponse } from '../response/create-lesson.response';
import { Lesson } from '../../../core/domain/model/Lesson';
import {
  UpdateGameModuleRequest,
  UpdateMcqGameModuleContract,
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
