import { GetUserTransactionsResult } from '../../../core/usecases/get-user-transactions.use-case';
import {
  GetUserTransactionsResponse,
  GetUserTransactionItem,
} from '../response/get-user-transactions-response';

export class GetUserTransactionsMapper {
  static fromDomain(
    result: GetUserTransactionsResult,
  ): GetUserTransactionsResponse {
    return new GetUserTransactionsResponse(
      result.transactions.map(
        (t) =>
          new GetUserTransactionItem({
            tickerName: t.tickerName,
            tickerSymbol: t.tickerSymbol,
            type: t.type,
            amount: t.amount,
            volume: t.volume,
            timestamp: t.timestamp,
          }),
      ),
    );
  }
}
