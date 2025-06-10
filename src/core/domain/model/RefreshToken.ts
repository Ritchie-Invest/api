import { DomainModel } from '../../base/domain-model';

export class RefreshToken extends DomainModel {
  userId: string;
  token: string;
  expiresAt: Date;

  constructor(id: string, userId: string, token: string, expiresAt: Date) {
    super(id);
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
  }
}
