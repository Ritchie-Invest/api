import { UseCase } from '../base/use-case';
import { UserNotFoundError } from '../domain/error/UserNotFoundError';
import { UserRepository } from '../domain/repository/user.repository';
import { TokenService } from '../domain/service/token.service';
import * as bcrypt from 'bcryptjs';

export type LoginCommand = {
  email: string;
  password: string;
};

export class LoginUseCase implements UseCase<LoginCommand, string> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginCommand): Promise<string> {
    const { email, password } = command;
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundError(email);
    }
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      // If the password is invalid, we still throw UserNotFoundError to prevent sensitive information leakage
      throw new UserNotFoundError(email);
    }

    const token = this.tokenService.generateToken({
      id: user.id,
      email: user.email,
      type: user.type,
    });

    return token;
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
