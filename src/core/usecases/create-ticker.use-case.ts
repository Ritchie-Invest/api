import { UseCase } from '../base/use-case';
import { Ticker } from '../domain/model/Ticker';
import { TickerRepository } from '../domain/repository/ticker.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { TickerAlreadyExistsError } from '../domain/error/TickerAlreadyExistsError';
import { Currency } from '../domain/type/Currency';
import { TickerType } from '../domain/type/TickerType';

export type CreateTickerCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  name: string;
  symbol: string;
  type: TickerType;
  currency: Currency;
};

export class CreateTickerUseCase
  implements UseCase<CreateTickerCommand, Ticker>
{
  constructor(private readonly tickerRepository: TickerRepository) {}

  async execute(command: CreateTickerCommand): Promise<Ticker> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can create tickers',
      );
    }

    const symbol = command.symbol.toUpperCase();
    const existing = await this.tickerRepository.findBySymbol(symbol);
    if (existing) {
      throw new TickerAlreadyExistsError('Ticker already exists');
    }

    const ticker = new Ticker({
      id: this.generateId(),
      name: command.name,
      symbol,
      type: command.type,
      currency: command.currency,
      history: [],
    });

    return this.tickerRepository.create(ticker);
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return (
      currentUser.type === UserType.ADMIN ||
      currentUser.type === UserType.SUPERADMIN
    );
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
