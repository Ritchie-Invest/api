import { DomainModel } from '../../base/domain-model';

export class Unit extends DomainModel {
  title: string;
  description: string;
  chapterId: string;
  is_published: boolean;
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    chapterId: string,
    is_published: boolean = false,
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
    this.is_published = is_published;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
