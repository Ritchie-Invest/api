import { GameModule } from './GameModule';
import { GameChoice } from './GameChoice';
import { TrueOrFalseModuleInvalidDataError } from '../error/TrueOrFalseModuleInvalidDataError';

export class TrueOrFalseModule extends GameModule {
  questions: GameChoice[];

  constructor(params: {
    id: string;
    lessonId: string;
    questions: GameChoice[];
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    super({ id: params.id, lessonId: params.lessonId });
    
    if (!Array.isArray(params.questions) || params.questions.length === 0) {
      throw new TrueOrFalseModuleInvalidDataError('At least one question is required');
    }
    
    for (const question of params.questions) {
      if (typeof question.isCorrect !== 'boolean') {
        throw new TrueOrFalseModuleInvalidDataError('Each question must have a valid boolean answer');
      }
    }
    
    this.questions = params.questions;
    this.updatedAt = params.updatedAt || new Date();
    this.createdAt = params.createdAt || new Date();
  }
}
