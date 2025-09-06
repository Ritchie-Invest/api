import { GameModule } from './GameModule';
import { GaugeModuleInvalidDataError } from '../error/GaugeModuleInvalidDataError';

export class GaugeModule extends GameModule {
  question: string;
  value: number;

  constructor(params: {
    id: string;
    lessonId: string;
    question: string;
    value: number;
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    super({ id: params.id, lessonId: params.lessonId });
    if (!params.question || params.question.trim().length === 0) {
      throw new GaugeModuleInvalidDataError('Question is required');
    }
    if (params.value < 0 || params.value > 100) {
      throw new GaugeModuleInvalidDataError('Value must be between 0 and 100');
    }
    this.question = params.question;
    this.value = params.value;
    this.updatedAt = params.updatedAt || new Date();
    this.createdAt = params.createdAt || new Date();
  }
}
