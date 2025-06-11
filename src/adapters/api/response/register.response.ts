import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../../core/domain/type/UserType';

export class RegisterResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  type: UserType;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: string,
    email: string,
    type: UserType,
    updatedAt: Date,
    createdAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.type = type;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}
