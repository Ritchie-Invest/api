import { DomainModel } from '../../base/domain-model';

export class Life extends DomainModel {
  userId: string;
  emissionDate: Date;

  constructor(id: string, userId: string, emissionDate?: Date) {
    super(id);
    this.userId = userId;
    this.emissionDate = emissionDate || new Date();
  }
}
