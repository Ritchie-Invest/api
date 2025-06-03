import { DomainModel } from '../../base/domain-model';
import { UserType } from '../type/UserType';

export class User extends DomainModel {
  email: string;
  password: string;
  type: UserType;
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    email: string,
    password: string,
    type: UserType,
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);
    this.email = email;
    this.password = password;
    this.type = type;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
