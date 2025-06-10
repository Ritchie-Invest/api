import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../../core/domain/type/UserType';

export type TokenPayload = {
  id: string;
  email: string;
  type: UserType;
};

@Injectable()
export class JwtServiceAdapter {
  private readonly accessSecret =
    process.env.JWT_ACCESS_SECRET || 'default_access_secret';
  private readonly refreshSecret =
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
  private readonly accessExpiresIn = '15m';
  private readonly refreshExpiresIn = '7d';

  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    return this.jwtService.verify(token, {
      secret: this.accessSecret,
    });
  }

  verifyRefreshToken(token: string): TokenPayload {
    return this.jwtService.verify(token, {
      secret: this.refreshSecret,
    });
  }
}
