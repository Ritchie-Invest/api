import { RefreshToken } from '@prisma/client';
import { Repository } from '../../base/repository';

export abstract class RefreshTokenRepository extends Repository<RefreshToken> {
  abstract expireNow(token: string): Promise<void> | void;
  abstract findByToken(
    token: string,
  ): Promise<RefreshToken | null> | RefreshToken | null;
}
