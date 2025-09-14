import { TokenPayload } from '../../adapters/jwt/jwt.service';
import { UseCase } from '../base/use-case';
import { TokenInvalidOrExpiredError } from '../domain/error/TokenInvalidOrExpiredError';
import { RefreshTokenRepository } from '../domain/repository/refresh-token.repository';
import { TokenService } from '../domain/service/token.service';

export type RefreshCommand = {
  token: string;
};

export type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};

export class RefreshUseCase implements UseCase<RefreshCommand, RefreshResult> {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: RefreshCommand): Promise<RefreshResult> {
    const { token } = command;
    let payload: TokenPayload;
    try {
      payload = this.tokenService.verifyRefreshToken(token);
    } catch {
      throw new TokenInvalidOrExpiredError(
        'Refresh token is invalid or expired',
      );
    }
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
      portfolioId: payload.portfolioId,
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      id: payload.id,
      email: payload.email,
      type: payload.type,
      portfolioId: payload.portfolioId,
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
