import { Repository } from '../../base/repository';
import { UserPortfolio } from '../model/UserPortfolio';

export abstract class UserPortfolioRepository extends Repository<UserPortfolio> {
  abstract findByUserId(
    userId: string,
  ): Promise<UserPortfolio | null> | UserPortfolio | null;
}
