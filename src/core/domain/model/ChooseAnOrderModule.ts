import { GameModule } from './GameModule';
import { ChooseAnOrderChoice } from './ChooseAnOrderChoice';
import { ChooseAnOrderModuleInvalidDataError } from '../error/ChooseAnOrderModuleInvalidDataError';

export class ChooseAnOrderModule extends GameModule {
  question: string;
  sentences: ChooseAnOrderChoice[];

  constructor(params: {
    id: string;
    lessonId: string;
    question: string;
    sentences: ChooseAnOrderChoice[];
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    super({ id: params.id, lessonId: params.lessonId });
    if (!params.question || params.question.trim().length === 0) {
      throw new ChooseAnOrderModuleInvalidDataError('Question is required');
    }
    if (!Array.isArray(params.sentences) || params.sentences.length < 2) {
      throw new ChooseAnOrderModuleInvalidDataError('At least two sentences are required');
    }
    
    const values = params.sentences.map(s => s.value);
    const uniqueValues = new Set(values);
    if (uniqueValues.size !== values.length) {
      throw new ChooseAnOrderModuleInvalidDataError('Each sentence must have a unique value');
    }
    
    this.question = params.question;
    this.sentences = params.sentences;
    this.updatedAt = params.updatedAt || new Date();
    this.createdAt = params.createdAt || new Date();
  }
}
