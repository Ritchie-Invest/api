import { GetPortfolioResult } from '../../../core/usecases/get-portfolio.use-case';
import { GetPortfolioResponse } from '../response/get-portfolio.response';

export class GetPortfolioMapper {
  static toResponse(result: GetPortfolioResult): GetPortfolioResponse {
    return new GetPortfolioResponse(
      result.currency,
      result.cash,
      result.investments,
      result.totalValue,
    );
  }
}
