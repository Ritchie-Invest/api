import { GameModule } from './GameModule';
import { TrueOrFalseModuleInvalidDataError } from '../error/TrueOrFalseModuleInvalidDataError';

export class TrueOrFalseModule extends GameModule {
  sentence: string;
  isTrue: boolean;

  constructor(params: {
    id: string;
    lessonId: string;
    sentence: string;
    isTrue: boolean;
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    super({ id: params.id, lessonId: params.lessonId });

    if (!params.sentence || params.sentence.trim().length === 0) {
      throw new TrueOrFalseModuleInvalidDataError('Sentence is required');
    }

    if (typeof params.isTrue !== 'boolean') {
      throw new TrueOrFalseModuleInvalidDataError('isTrue must be a boolean');
    }

    this.sentence = params.sentence;
    this.isTrue = params.isTrue;
    this.updatedAt = params.updatedAt || new Date();
    this.createdAt = params.createdAt || new Date();
  }
}
