import { GameModule } from './GameModule';
import { GameChoice } from './GameChoice';
import { FillInTheBlankModuleInvalidDataError } from '../error/FillInTheBlankModuleInvalidDataError';

export class FillInTheBlankModule extends GameModule {
  firstText: string;
  secondText: string;
  blanks: GameChoice[];

  constructor(params: {
    id: string;
    lessonId: string;
    firstText: string;
    secondText: string;
    blanks: GameChoice[];
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    super({ id: params.id, lessonId: params.lessonId });
    if (!params.firstText || params.firstText.trim().length === 0) {
      throw new FillInTheBlankModuleInvalidDataError('First text is required');
    }
    if (!params.secondText || params.secondText.trim().length === 0) {
      throw new FillInTheBlankModuleInvalidDataError('Second text is required');
    }
    if (!Array.isArray(params.blanks) || params.blanks.length < 2) {
      throw new FillInTheBlankModuleInvalidDataError('At least two blanks are required');
    }
    if (params.blanks.filter((blank) => blank.isCorrect).length !== 1) {
      throw new FillInTheBlankModuleInvalidDataError(
        'Exactly one option must be marked as correct',
      );
    }
    this.firstText = params.firstText;
    this.secondText = params.secondText;
    this.blanks = params.blanks;
    this.updatedAt = params.updatedAt || new Date();
    this.createdAt = params.createdAt || new Date();
  }
}
