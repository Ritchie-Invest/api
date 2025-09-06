import { Repository } from '../../base/repository';
import { PortfolioTicker } from '../model/PortfolioTicker';

export abstract class PortfolioTickerRepository extends Repository<PortfolioTicker> {
  abstract findByPortfolioIdTickerIdAndDate(portfolioId: string, tickerId: string, date: Date): Promise<PortfolioTicker | null> | PortfolioTicker | null;
}