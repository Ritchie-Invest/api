import { DomainModel } from '../../base/domain-model';
import { LessonInvalidDataError } from '../error/LessonInvalidDataError';
import { GameModule } from './GameModule';

export class Lesson extends DomainModel {
  title: string;
  description: string;
  chapterId: string;
  order?: number;
  isPublished: boolean;
  modules: GameModule[];
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    chapterId: string,
    order: number | undefined,
    isPublished: boolean = false,
    modules: GameModule[] = [],
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);

    if (!title) {
      throw new LessonInvalidDataError('Title is required');
    }

    if (!description) {
      throw new LessonInvalidDataError('Description is required');
    }

    this.title = title;
    this.description = description;
    this.chapterId = chapterId;
    this.order = order;
    this.isPublished = isPublished;
    this.modules = modules;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
