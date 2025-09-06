import { Repository } from '../../base/repository';
import { PortfolioValue } from '../model/PortfolioValue';

export abstract class PortfolioValueRepository extends Repository<PortfolioValue> {
  abstract findByPortfolioIdAndDate(
    portfolioId: string,
    date: Date,
  ): Promise<PortfolioValue | null> | PortfolioValue | null;
}
