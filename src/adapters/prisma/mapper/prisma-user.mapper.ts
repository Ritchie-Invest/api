import { EntityMapper } from '../../../core/base/entity-mapper';
import { User } from '../../../core/domain/model/User';
import { User as UserEntity, $Enums } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { UserType } from '../../../core/domain/type/UserType';

@Injectable()
export class PrismaUserMapper implements EntityMapper<User, UserEntity> {
  fromDomain(model: User): UserEntity {
    return {
      id: model.id,
      email: model.email,
      password: model.password,
      type: model.type,
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
    };
  }

  toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      password: entity.password,
      type: this.mapUserTypeToDomain(entity.type),
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }

  private mapUserTypeToDomain(type: $Enums.UserType): UserType {
    switch (type) {
      case 'SUPERADMIN':
        return UserType.SUPERADMIN;
      case 'ADMIN':
        return UserType.ADMIN;
      case 'STUDENT':
        return UserType.STUDENT;
      default:
        throw new Error('Invalid user type');
    }
  }
}
