import { TokenPayload } from '../../../adapters/jwt/jwt.service';

export interface TokenService {
  generateAccessToken(payload: Record<string, any>): string;
  generateRefreshToken(payload: Record<string, any>): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
