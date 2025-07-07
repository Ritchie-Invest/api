import { DomainModel } from '../../base/domain-model';

export enum ProgressionType {
  QUESTION = 'question',
  LESSON = 'lesson',
}

export class Progression extends DomainModel {
  userId: string;
  entryId: string;
  type: ProgressionType;
  completed: boolean;
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    userId: string,
    entryId: string,
    type: ProgressionType,
    completed: boolean,
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);
    this.userId = userId;
    this.entryId = entryId;
    this.type = type;
    this.completed = completed;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
