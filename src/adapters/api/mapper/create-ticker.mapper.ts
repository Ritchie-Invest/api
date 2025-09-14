import { CreateTickerCommand } from '../../../core/usecases/create-ticker.use-case';
import { CreateTickerRequest } from '../request/create-ticker.request';
import { CreateTickerResponse } from '../response/create-ticker.response';
import { Ticker } from '../../../core/domain/model/Ticker';
import { ProfileRequest } from '../request/profile.request';

export class CreateTickerMapper {
  static toDomain(
    currentUser: ProfileRequest,
    request: CreateTickerRequest,
  ): CreateTickerCommand {
    return {
      currentUser: { id: currentUser.id, type: currentUser.type },
      name: request.name,
      symbol: request.symbol,
      type: request.type,
      currency: request.currency,
    };
  }

  static fromDomain(ticker: Ticker): CreateTickerResponse {
    return new CreateTickerResponse({
      id: ticker.id,
      name: ticker.name,
      symbol: ticker.symbol,
      type: ticker.type,
      currency: ticker.currency,
    });
  }
}
