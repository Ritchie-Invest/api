import { UseCase } from '../base/use-case';
import { UserNotFoundError } from '../domain/error/UserNotFoundError';
import { User } from '../domain/model/User';
import { RefreshTokenRepository } from '../domain/repository/refresh-token.repository';
import { UserRepository } from '../domain/repository/user.repository';

export type LogoutCommand = {
  currentUser: Pick<User, 'email'>;
  refreshToken: string;
};

export class LogoutUseCase implements UseCase<LogoutCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { currentUser, refreshToken } = command;

    const user = await this.userRepository.findByEmail(currentUser.email);
    if (!user) {
      throw new UserNotFoundError(currentUser.email);
    }

    await this.refreshTokenRepository.expireNow(refreshToken);
  }
}
