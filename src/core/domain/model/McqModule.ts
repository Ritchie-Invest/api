import { GameModule } from './GameModule';
import { McqChoice } from './McqChoice';
import { McqModuleInvalidDataError } from '../error/McqModuleInvalidDataError';

export class McqModule extends GameModule {
  question: string;
  choices: McqChoice[];

  constructor(params: {
    id: string;
    lessonId: string;
    question: string;
    choices: McqChoice[];
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    super({ id: params.id, lessonId: params.lessonId });
    if (!params.question || params.question.trim().length === 0) {
      throw new McqModuleInvalidDataError('Question is required');
    }
    if (!Array.isArray(params.choices) || params.choices.length < 2) {
      throw new McqModuleInvalidDataError('At least two choices are required');
    }
    if (params.choices.filter((choice) => choice.isCorrect).length !== 1) {
      throw new McqModuleInvalidDataError(
        'Exactly one choice must be marked as correct',
      );
    }
    this.question = params.question;
    this.choices = params.choices;
    this.updatedAt = params.updatedAt || new Date();
    this.createdAt = params.createdAt || new Date();
  }
}
