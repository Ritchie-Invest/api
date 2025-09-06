import { UseCase } from '../base/use-case';
import { UserAlreadyExistsError } from '../domain/error/UserAlreadyExistsError';
import { WrongEmailFormatError } from '../domain/error/WrongEmailFormatError';
import { WrongPasswordFormatError } from '../domain/error/WrongPasswordFormatError';
import { User } from '../domain/model/User';
import { UserPortfolio } from '../domain/model/UserPortfolio';
import { PortfolioValue } from '../domain/model/PortfolioValue';
import { UserRepository } from '../domain/repository/user.repository';
import { UserPortfolioRepository } from '../domain/repository/user-portfolio.repository';
import { PortfolioValueRepository } from '../domain/repository/portfolio-value.repository';
import { UserType } from '../domain/type/UserType';
import { Currency } from '../domain/type/Currency';
import * as bcrypt from 'bcryptjs';

export type CreateUserCommand = {
  email: string;
  password: string;
};

export class CreateUserUseCase implements UseCase<CreateUserCommand, User> {
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly PASSWORD_LENGTH = 8;
  private readonly INITIAL_CASH = 10000;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPortfolioRepository: UserPortfolioRepository,
    private readonly portfolioValueRepository: PortfolioValueRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
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

    // Create portfolio for the user
    const portfolio = new UserPortfolio({
      id: this.generateId(),
      userId: user.id,
      currency: Currency.USD,
    });
    await this.userPortfolioRepository.create(portfolio);

    // Create initial portfolio value with $10,000 cash
    const portfolioValue = new PortfolioValue({
      id: this.generateId(),
      portfolioId: portfolio.id,
      cash: this.INITIAL_CASH,
      investments: 0,
      date: new Date(),
    });
    await this.portfolioValueRepository.create(portfolioValue);

    return user;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
