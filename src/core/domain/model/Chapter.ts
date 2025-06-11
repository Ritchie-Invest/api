import { DomainModel } from '../../base/domain-model';
import { ChapterInvalidDataError } from '../error/ChapterInvalidDataError';

export class Chapter extends DomainModel {
  title: string;
  description: string;
  isPublished: boolean;
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
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

    this.title = title;
    this.description = description;
    this.isPublished = isPublished;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
