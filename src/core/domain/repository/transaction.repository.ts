import { Repository } from '../../base/repository';
import { Transaction } from '../model/Transaction';

export abstract class TransactionRepository extends Repository<Transaction> {
  abstract findByPortfolioIdAndTickerId(
    portfolioId: string,
    tickerId: string,
  ): Promise<Transaction[]> | Transaction[];
}
