import { DomainModel } from '../../base/domain-model';

export class Progression extends DomainModel {
  userId: string;
  gameModuleId: string;
  isCompleted: boolean;
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    userId: string,
    gameModuleId: string,
    isCompleted: boolean,
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);
    this.userId = userId;
    this.gameModuleId = gameModuleId;
    this.isCompleted = isCompleted;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
