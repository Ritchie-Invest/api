import { Injectable } from '@nestjs/common';
import { EntityMapper } from '../../../core/base/entity-mapper';
import { RefreshToken as RefreshTokenEntity } from '@prisma/client';
import { RefreshToken } from '../../../core/domain/model/RefreshToken';

@Injectable()
export class PrismaRefreshTokenMapper
  implements EntityMapper<RefreshToken, RefreshTokenEntity>
{
  fromDomain(model: RefreshToken): RefreshTokenEntity {
    return {
      id: model.id,
      userId: model.userId,
      token: model.token,
      expiresAt: model.expiresAt,
    };
  }
  toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken(
      entity.id,
      entity.userId,
      entity.token,
      entity.expiresAt,
    );
  }
}
