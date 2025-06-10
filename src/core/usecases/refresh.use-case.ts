import { TokenPayload } from '../../adapters/jwt/jwt.service';
import { UseCase } from '../base/use-case';
import { TokenInvalidOrExpiredError } from '../domain/error/TokenInvalidOrExpiredError';
import { RefreshTokenRepository } from '../domain/repository/refresh-token.repository';
import { TokenService } from '../domain/service/token.service';
import { LoginResult } from './login.use-case';

export type RefreshCommand = {
  token: string;
};

export class RefreshUseCase implements UseCase<RefreshCommand, LoginResult> {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: RefreshCommand): Promise<LoginResult> {
    const { token } = command;
    const payload: TokenPayload = this.tokenService.verifyRefreshToken(token);
    const dbToken = await this.refreshTokenRepository.findByToken(token);

    if (!payload || !dbToken || dbToken.expiresAt <= new Date()) {
      throw new TokenInvalidOrExpiredError(
        'Refresh token is invalid or expired',
      );
    }

    await this.refreshTokenRepository.expireNow(token);

    const accessToken = this.tokenService.generateAccessToken({
      id: payload.id,
      email: payload.email,
      type: payload.type,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      id: payload.id,
      email: payload.email,
      type: payload.type,
    });

    await this.refreshTokenRepository.create({
      userId: payload.id,
      token: refreshToken,
      expiresAt: new Date(
        Date.now() +
          parseInt(process.env.REFRESH_TOKEN_TTL_MS || '604800000', 10),
      ),
    });

    return { accessToken, refreshToken };
  }
}
