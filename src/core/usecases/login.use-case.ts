import { UseCase } from '../base/use-case';
import { UserEmailNotFoundError } from '../domain/error/UserEmailNotFoundError';
import { RefreshTokenRepository } from '../domain/repository/refresh-token.repository';
import { UserRepository } from '../domain/repository/user.repository';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { TokenService } from '../domain/service/token.service';
import * as bcrypt from 'bcryptjs';
import { PortfolioPositionRepository } from '../domain/repository/portfolio-position.repository';
import { UserPortfolio } from '../domain/model/UserPortfolio';
import { Currency } from '../domain/type/Currency';
import { PortfolioPosition } from '../domain/model/PortfolioPosition';
import { Email } from '../domain/value-object/Email';

export type LoginCommand = {
  email: Email;
  password: string;
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
};

export class LoginUseCase implements UseCase<LoginCommand, LoginResult> {
  private readonly INITIAL_CASH = 10000;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userPortfolioRepository: UserPortfolioRepository,
    private readonly portfolioPositionRepository: PortfolioPositionRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const { email, password } = command;
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserEmailNotFoundError(email);
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UserEmailNotFoundError(email);
    }

    let portfolio = await this.userPortfolioRepository.findByUserId(user.id);
    if (!portfolio) {
      portfolio = new UserPortfolio({
        id: this.generateId(),
        userId: user.id,
        currency: Currency.USD,
      });
      await this.userPortfolioRepository.create(portfolio);

      const portfolioPosition = new PortfolioPosition({
        id: this.generateId(),
        portfolioId: portfolio.id,
        cash: this.INITIAL_CASH,
        investments: 0,
        date: new Date(),
      });
      await this.portfolioPositionRepository.create(portfolioPosition);
    }

    const accessToken = this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email.value(),
      type: user.type,
      portfolioId: portfolio.id,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      id: user.id,
      email: user.email.value(),
      type: user.type,
      portfolioId: portfolio.id,
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

  private generateId(): string {
    return crypto.randomUUID();
  }
}
