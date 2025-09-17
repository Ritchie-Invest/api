import { DomainModel } from '../../base/domain-model';

export class Life extends DomainModel {
  userId: string;
  lostAt: Date;

  constructor(params: { id: string; userId: string; lostAt?: Date }) {
    super(params.id);
    this.userId = params.userId;
    this.lostAt = params.lostAt || new Date();
  }
}
