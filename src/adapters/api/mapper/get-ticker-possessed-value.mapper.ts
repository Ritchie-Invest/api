import { GetTickerPossessedValueResult } from '../../../core/usecases/get-ticker-possessed-value.use-case';
import { GetTickerPossessedValueResponse } from '../response/get-ticker-possessed-value.response';

export class GetTickerPossessedValueMapper {
  static fromDomain(
    domain: GetTickerPossessedValueResult,
  ): GetTickerPossessedValueResponse {
    const response = new GetTickerPossessedValueResponse();
    response.shares = domain.shares;
    response.amount = domain.amount;
    return response;
  }
}
