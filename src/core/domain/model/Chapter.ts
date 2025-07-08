import { DomainModel } from '../../base/domain-model';
import { ChapterInvalidDataError } from '../error/ChapterInvalidDataError';

export class Chapter extends DomainModel {
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    order: number,
    isPublished: boolean = false,
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);

    if (!title) {
      throw new ChapterInvalidDataError('Title is required');
    }

    if (!description) {
      throw new ChapterInvalidDataError('Description is required');
    }

    if (order < 0) {
      throw new ChapterInvalidDataError('Order must be a positive number');
    }

    this.title = title;
    this.description = description;
    this.order = order;
    this.isPublished = isPublished;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
