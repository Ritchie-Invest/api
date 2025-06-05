import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../../core/domain/type/UserType';
import { IsEnum } from 'class-validator';

export class UpdateUserTypeRequest {
  @ApiProperty({ enum: UserType })
  @IsEnum(UserType)
  type: UserType;

  constructor(type: UserType) {
    this.type = type;
  }
}
