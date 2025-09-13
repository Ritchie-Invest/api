import { Repository } from '../../base/repository';
import { PortfolioPosition } from '../model/PortfolioPosition';

export abstract class PortfolioPositionRepository extends Repository<PortfolioPosition> {
  abstract findByPortfolioIdAndDate(
    portfolioId: string,
    date: Date,
  ): Promise<PortfolioPosition | null> | PortfolioPosition | null;

  abstract findLatestByPortfolioId(
    portfolioId: string,
  ): Promise<PortfolioPosition | null> | PortfolioPosition | null;

  abstract findAllByPortfolioId(
    portfolioId: string,
    limit?: number,
  ): Promise<PortfolioPosition[]> | PortfolioPosition[];

  abstract countByPortfolioId(portfolioId: string): Promise<number> | number;
}
