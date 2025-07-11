import { UseCase } from '../base/use-case';
import { UserAlreadyExistsError } from '../domain/error/UserAlreadyExistsError';
import { WrongEmailFormatError } from '../domain/error/WrongEmailFormatError';
import { WrongPasswordFormatError } from '../domain/error/WrongPasswordFormatError';
import { User } from '../domain/model/User';
import { UserRepository } from '../domain/repository/user.repository';
import { UserType } from '../domain/type/UserType';
import * as bcrypt from 'bcryptjs';
import { RefreshTokenRepository } from '../domain/repository/refresh-token.repository';
import { TokenService } from '../domain/service/token.service';

export type CreateUserCommand = {
  email: string;
  password: string;
};

export type CreateUserResult = {
  accessToken: string;
  refreshToken: string;
};

export class CreateUserUseCase
  implements UseCase<CreateUserCommand, CreateUserResult>
{
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly PASSWORD_LENGTH = 8;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const { email, password } = command;

    if (!this.EMAIL_REGEX.test(email)) {
      throw new WrongEmailFormatError(email);
    }

    if (password.length < this.PASSWORD_LENGTH) {
      throw new WrongPasswordFormatError(
        `Password must be at least ${this.PASSWORD_LENGTH} characters long`,
      );
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User(
      this.generateId(),
      email,
      hashedPassword,
      UserType.STUDENT,
    );

    await this.userRepository.create(user);

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

  private generateId(): string {
    return crypto.randomUUID();
  }
}
