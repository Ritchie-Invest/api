import { UseCase } from '../base/use-case';
import { UserNotFoundError } from '../domain/error/UserNotFoundError';
import { RefreshTokenRepository } from '../domain/repository/refresh-token.repository';
import { UserRepository } from '../domain/repository/user.repository';
import { TokenService } from '../domain/service/token.service';
import * as bcrypt from 'bcryptjs';

export type LoginCommand = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
};

export class LoginUseCase implements UseCase<LoginCommand, LoginResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const { email, password } = command;
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundError(email);
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UserNotFoundError(email);
    }

    const accessToken = this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      type: user.type,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      id: user.id,
      email: user.email,
      type: user.type,
    });

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(
        Date.now() +
          parseInt(process.env.REFRESH_TOKEN_TTL_MS || '604800000', 10),
      ),
    });

    return { accessToken, refreshToken };
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
