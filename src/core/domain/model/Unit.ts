import { DomainModel } from '../../base/domain-model';

export class Unit extends DomainModel {
  title: string;
  description: string;
  chapterId: string;
  isPublished: boolean;
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    chapterId: string,
    isPublished: boolean = false,
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);

    if (!title) {
      throw new Error('Name is required');
    }

    if (!description) {
      throw new Error('Description is required');
    }

    this.title = title;
    this.description = description;
    this.chapterId = chapterId;
    this.isPublished = isPublished;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
