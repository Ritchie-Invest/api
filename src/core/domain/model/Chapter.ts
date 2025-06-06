import { DomainModel } from '../../base/domain-model';

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
    is_published: boolean = false,
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);

    if (!title) {
      throw new Error('Title is required');
    }

    if (!description) {
      throw new Error('Description is required');
    }

    this.title = title;
    this.description = description;
    this.isPublished = is_published;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
