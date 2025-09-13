import { GetPortfolioPositionsResult } from '../../../core/usecases/get-portfolio-positions.use-case';
import {
  GetPortfolioPositionsResponse,
  PortfolioPositionResponse,
} from '../response/get-portfolio-positions.response';
import { PortfolioPosition } from '../../../core/domain/model/PortfolioPosition';

export class GetPortfolioPositionsMapper {
  static toResponse(
    result: GetPortfolioPositionsResult,
  ): GetPortfolioPositionsResponse {
    const positions = result.positions.map((position) =>
      GetPortfolioPositionsMapper.toPortfolioPositionResponse(position),
    );

    return new GetPortfolioPositionsResponse(
      positions,
      result.total,
      result.variation,
      result.variationPercent,
      result.variationDirection,
    );
  }

  private static toPortfolioPositionResponse(
    position: PortfolioPosition,
  ): PortfolioPositionResponse {
    return new PortfolioPositionResponse(
      position.id,
      position.cash,
      position.investments,
      position.date,
    );
  }
}
