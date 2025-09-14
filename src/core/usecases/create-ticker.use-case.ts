import { UseCase } from '../base/use-case';
import { Ticker } from '../domain/model/Ticker';
import { TickerRepository } from '../domain/repository/ticker.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { TickerAlreadyExistsError } from '../domain/error/TickerAlreadyExistsError';
import { Currency } from '../domain/type/Currency';
import { TickerType } from '../domain/type/TickerType';
import { MarketService } from '../domain/service/market.service';

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
  constructor(
    private readonly tickerRepository: TickerRepository,
    private readonly marketService: MarketService,
  ) {}

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

    await this.tickerRepository.create(ticker);

    const barsFromMarket = await this.marketService.getLatestDailyBars(
      ticker.symbol,
    );

    if (barsFromMarket && barsFromMarket.length > 0) {
      const sortedBars = barsFromMarket.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      );
      await this.tickerRepository.addDailyBars(ticker.id, sortedBars);
    }

    return ticker;
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
